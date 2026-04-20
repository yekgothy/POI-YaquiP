const jwt = require("jsonwebtoken");
const User = require("./models/User");
const Message = require("./models/Message");
const Channel = require("./models/Channel");

module.exports = function setupSocket(io) {
  // Authenticate socket connections via JWT
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error("No token provided"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
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

    // Mark user online
    await User.findByIdAndUpdate(user._id, { online: true });
    io.emit("user:online", {
      userId: user._id,
      displayName: user.displayName,
      username: user.username,
      avatar: user.avatar || "",
      online: true,
    });

    // --- JOIN CHANNEL ---
    socket.on("channel:join", async (channelId) => {
      socket.join(channelId);
      console.log(`📺 ${user.displayName} joined channel ${channelId}`);
    });

    // --- LEAVE CHANNEL ---
    socket.on("channel:leave", (channelId) => {
      socket.leave(channelId);
    });

    // --- SEND MESSAGE ---
    socket.on("message:send", async (data) => {
      try {
        const { channelId, content } = data;
        if (!content || !content.trim()) return;

        // Save to DB
        const message = new Message({
          content: content.trim(),
          sender: user._id,
          channel: channelId,
          type: "text",
        });
        await message.save();

        // Populate sender info
        await message.populate("sender", "displayName username avatar online");

        // Broadcast to everyone in the channel
        io.to(channelId).emit("message:new", message);
      } catch (err) {
        console.error("Error sending message:", err.message);
        socket.emit("error", { message: "Error al enviar mensaje" });
      }
    });

    // --- TYPING INDICATOR ---
    socket.on("message:typing", ({ channelId }) => {
      socket.to(channelId).emit("message:typing", {
        userId: user._id,
        displayName: user.displayName,
      });
    });

    socket.on("message:stopTyping", ({ channelId }) => {
      socket.to(channelId).emit("message:stopTyping", {
        userId: user._id,
      });
    });

    // --- DISCONNECT ---
    socket.on("disconnect", async () => {
      console.log(`❌ ${user.displayName} disconnected`);
      await User.findByIdAndUpdate(user._id, {
        online: false,
        lastSeen: new Date(),
      });
      io.emit("user:online", {
        userId: user._id,
        displayName: user.displayName,
        username: user.username,
        avatar: user.avatar || "",
        online: false,
      });
    });
  });
};
