const jwt = require("jsonwebtoken");
const db = require("./lib/db");
const mediaServer = require("./lib/mediasoup");

module.exports = function setupSocket(io) {
  const connectionCounts = new Map();

  function getConnectionCount(userId) {
    return connectionCounts.get(userId) || 0;
  }

  function incConnectionCount(userId) {
    const next = getConnectionCount(userId) + 1;
    connectionCounts.set(userId, next);
    return next;
  }

  function decConnectionCount(userId) {
    const next = Math.max(0, getConnectionCount(userId) - 1);
    if (next === 0) {
      connectionCounts.delete(userId);
    } else {
      connectionCounts.set(userId, next);
    }
    return next;
  }

  // Authenticate socket connections via JWT
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error("No token provided"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await db.findUserById(decoded.userId);
      if (!user) return next(new Error("User not found"));

      socket.user = user;
      next();
    } catch {
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", async (socket) => {
    const user = socket.user;
    console.log(`✅ ${user.displayName} connected (${socket.id})`);

    socket.join(`user:${user._id}`);

    // Mark user online
    const activeConnections = incConnectionCount(user._id);
    if (activeConnections === 1) {
      await db.setUserOnline(user._id, true);
      io.emit("user:online", {
        userId: user._id,
        displayName: user.displayName,
        username: user.username,
        avatar: user.avatar || "",
        online: true,
      });
    }

    try {
      const unreadSummary = await db.getUnreadCountsForUser(user._id);
      socket.emit("unread:summary", unreadSummary);
    } catch (err) {
      console.error("Error loading unread summary:", err.message);
    }

    // --- JOIN CHANNEL ---
    socket.on("channel:join", async (channelId, ack) => {
      const canAccess = await db.canUserAccessChannel(user._id, channelId);
      if (!canAccess) {
        if (typeof ack === "function") {
          ack({ ok: false, error: "No tienes acceso a este canal" });
        }
        return;
      }

      socket.join(channelId);
      console.log(`📺 ${user.displayName} joined channel ${channelId}`);

      if (typeof ack === "function") {
        ack({ ok: true });
      }
    });

    // --- LEAVE CHANNEL ---
    socket.on("channel:leave", (channelId) => {
      socket.leave(channelId);
    });

    // --- SEND MESSAGE ---
    socket.on("message:send", async (data, ack) => {
      try {
        const { channelId, content, type, attachment } = data;
        const normalizedType = ["text", "image", "video", "audio", "file", "system"].includes(type)
          ? type
          : "text";
        const hasAttachment =
          attachment &&
          typeof attachment.url === "string" &&
          typeof attachment.path === "string" &&
          typeof attachment.name === "string";

        if ((!content || !content.trim()) && !hasAttachment) {
          if (typeof ack === "function") {
            ack({ ok: false, error: "El mensaje está vacío" });
          }
          return;
        }

        const canAccess = await db.canUserAccessChannel(user._id, channelId);
        if (!canAccess) {
          if (typeof ack === "function") {
            ack({ ok: false, error: "No tienes acceso a este canal" });
          }
          return;
        }

        // Save to DB
        const message = await db.createMessage({
          content: String(content || "").trim(),
          senderId: user._id,
          channelId,
          type: normalizedType,
          attachment: hasAttachment ? attachment : null,
        });

        // Broadcast to everyone in the channel
        io.to(channelId).emit("message:new", message);

        const channel = await db.findChannelById(channelId);
        const recipientUserIds = await db.listRecipientUserIdsForChannel(channelId);
        const preview = String(content || attachment?.name || "").trim().slice(0, 120);
        for (const recipientId of recipientUserIds) {
          if (recipientId === user._id) continue;
          io.to(`user:${recipientId}`).emit("unread:increment", {
            channelId,
            serverId: channel?.isDM ? "dms" : channel?.team,
            amount: 1,
            senderId: user._id,
            senderName: user.displayName,
            channelName: channel?.name || "chat",
            isDM: !!channel?.isDM,
            preview,
          });
        }

        if (typeof ack === "function") {
          ack({ ok: true, messageId: message._id });
        }
      } catch (err) {
        console.error("Error sending message:", err.message);
        socket.emit("error", { message: "Error al enviar mensaje" });
        if (typeof ack === "function") {
          ack({ ok: false, error: "Error al enviar mensaje" });
        }
      }
    });

    // --- TYPING INDICATOR ---
    socket.on("message:typing", async ({ channelId }) => {
      const canAccess = await db.canUserAccessChannel(user._id, channelId);
      if (!canAccess) return;

      socket.to(channelId).emit("message:typing", {
        userId: user._id,
        displayName: user.displayName,
      });
    });

    socket.on("message:stopTyping", async ({ channelId }) => {
      const canAccess = await db.canUserAccessChannel(user._id, channelId);
      if (!canAccess) return;

      socket.to(channelId).emit("message:stopTyping", {
        userId: user._id,
      });
    });

    // --- CALLS ---
    socket.on("call:initiate", async ({ targetUserId, channelId, callType, callId, roomName }, ack) => {
      try {
        let recipientIds = [];

        if (callType === "group" && channelId) {
          recipientIds = await db.listRecipientUserIdsForChannel(channelId);
          recipientIds = recipientIds.filter((recipientId) => recipientId !== user._id);
        } else if (targetUserId) {
          const targetUser = await db.findUserById(targetUserId);
          if (!targetUser) {
            if (typeof ack === "function") {
              ack({ ok: false, error: "User not found" });
            }
            return;
          }

          recipientIds = [targetUserId];
        }

        if (!recipientIds.length) {
          if (typeof ack === "function") {
            ack({ ok: false, error: "No recipients found for call" });
          }
          return;
        }

        for (const recipientId of recipientIds) {
          io.to(`user:${recipientId}`).emit("call:incoming", {
            callId,
            roomName,
            callerId: user._id,
            callerName: user.displayName,
            callerAvatar: user.avatar,
            channelId,
            callType: callType || "direct",
          });
        }

        if (typeof ack === "function") {
          ack({ ok: true });
        }
      } catch (error) {
        console.error("Error initiating call:", error);
        if (typeof ack === "function") {
          ack({ ok: false, error: error.message });
        }
      }
    });

    socket.on("mediasoup:join-room", async ({ callId }, ack) => {
      try {
        const call = await db.getCallById(callId);
        if (!call || call.status !== "active") {
          throw new Error("Call is not active");
        }

        if (call.channel_id) {
          const canAccess = await db.canUserAccessChannel(user._id, call.channel_id);
          if (!canAccess) {
            throw new Error("No tienes acceso a esta llamada");
          }
        }

        socket.join(`call:${callId}`);
        socket.data.callId = callId;

        const result = await mediaServer.joinRoom({
          roomId: callId,
          peerId: socket.id,
          metadata: {
            userId: user._id,
            displayName: user.displayName,
            avatar: user.avatar || "",
          },
        });

        if (typeof ack === "function") {
          ack({ ok: true, ...result });
        }
      } catch (error) {
        if (typeof ack === "function") {
          ack({ ok: false, error: error.message });
        }
      }
    });

    socket.on("mediasoup:create-transport", async ({ callId, direction }, ack) => {
      try {
        const transport = await mediaServer.createTransport({
          roomId: callId,
          peerId: socket.id,
          direction,
        });

        if (typeof ack === "function") {
          ack({ ok: true, transport });
        }
      } catch (error) {
        if (typeof ack === "function") {
          ack({ ok: false, error: error.message });
        }
      }
    });

    socket.on("mediasoup:connect-transport", async ({ callId, transportId, dtlsParameters }, ack) => {
      try {
        await mediaServer.connectTransport({
          roomId: callId,
          peerId: socket.id,
          transportId,
          dtlsParameters,
        });

        if (typeof ack === "function") {
          ack({ ok: true });
        }
      } catch (error) {
        if (typeof ack === "function") {
          ack({ ok: false, error: error.message });
        }
      }
    });

    socket.on("mediasoup:produce", async ({ callId, transportId, kind, rtpParameters, appData }, ack) => {
      try {
        const result = await mediaServer.produce({
          roomId: callId,
          peerId: socket.id,
          transportId,
          kind,
          rtpParameters,
          appData,
        });

        socket.to(`call:${callId}`).emit("mediasoup:new-producer", result);

        if (typeof ack === "function") {
          ack({ ok: true, id: result.producerId });
        }
      } catch (error) {
        if (typeof ack === "function") {
          ack({ ok: false, error: error.message });
        }
      }
    });

    socket.on("mediasoup:consume", async ({ callId, transportId, producerId, rtpCapabilities }, ack) => {
      try {
        const consumer = await mediaServer.consume({
          roomId: callId,
          peerId: socket.id,
          transportId,
          producerId,
          rtpCapabilities,
        });

        if (typeof ack === "function") {
          ack({ ok: true, consumer });
        }
      } catch (error) {
        if (typeof ack === "function") {
          ack({ ok: false, error: error.message });
        }
      }
    });

    socket.on("mediasoup:resume-consumer", async ({ callId, consumerId }, ack) => {
      try {
        await mediaServer.resumeConsumer({
          roomId: callId,
          peerId: socket.id,
          consumerId,
        });

        if (typeof ack === "function") {
          ack({ ok: true });
        }
      } catch (error) {
        if (typeof ack === "function") {
          ack({ ok: false, error: error.message });
        }
      }
    });

    socket.on("mediasoup:leave-room", ({ callId }, ack) => {
      const targetCallId = callId || socket.data.callId;
      if (targetCallId) {
        const { closedProducerIds } = mediaServer.closePeer(targetCallId, socket.id);
        socket.leave(`call:${targetCallId}`);
        socket.data.callId = null;

        for (const producerId of closedProducerIds) {
          socket.to(`call:${targetCallId}`).emit("mediasoup:producer-closed", {
            producerId,
            peerId: socket.id,
          });
        }
      }

      if (typeof ack === "function") {
        ack({ ok: true });
      }
    });

    socket.on("call:accept", async ({ callId, roomName }, ack) => {
      try {
        // Notify all participants that call was accepted
        io.emit("call:accepted", {
          callId,
          roomName,
          userId: user._id,
        });

        if (typeof ack === "function") {
          ack({ ok: true });
        }
      } catch (error) {
        console.error("Error accepting call:", error);
        if (typeof ack === "function") {
          ack({ ok: false, error: error.message });
        }
      }
    });

    socket.on("call:reject", async ({ callId }, ack) => {
      try {
        io.emit("call:rejected", {
          callId,
          userId: user._id,
        });

        if (typeof ack === "function") {
          ack({ ok: true });
        }
      } catch (error) {
        console.error("Error rejecting call:", error);
        if (typeof ack === "function") {
          ack({ ok: false, error: error.message });
        }
      }
    });

    socket.on("call:ended", async ({ callId }, ack) => {
      try {
        io.to(`call:${callId}`).emit("call:ended", {
          callId,
          userId: user._id,
        });

        if (typeof ack === "function") {
          ack({ ok: true });
        }
      } catch (error) {
        console.error("Error ending call:", error);
        if (typeof ack === "function") {
          ack({ ok: false, error: error.message });
        }
      }
    });

    // --- DISCONNECT ---
    socket.on("disconnect", async () => {
      console.log(`❌ ${user.displayName} disconnected`);

      if (socket.data.callId) {
        const callId = socket.data.callId;
        const { closedProducerIds } = mediaServer.closePeer(callId, socket.id);
        for (const producerId of closedProducerIds) {
          socket.to(`call:${callId}`).emit("mediasoup:producer-closed", {
            producerId,
            peerId: socket.id,
          });
        }
      }

      const remaining = decConnectionCount(user._id);
      if (remaining === 0) {
        await db.setUserOnline(user._id, false);
        io.emit("user:online", {
          userId: user._id,
          displayName: user.displayName,
          username: user.username,
          avatar: user.avatar || "",
          online: false,
        });
      }
    });
  });
};
