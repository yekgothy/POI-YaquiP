import { useState, useEffect, useCallback, useRef } from "react";
import { getSocket } from "../lib/socket";
import { api, API_URL } from "../lib/api";
import { useAuth } from "../context/AuthContext";

interface ChatAttachment {
  url: string;
  path: string;
  name: string;
  size: number;
  mimeType: string;
}

export interface ChatMessage {
  _id: string;
  content: string;
  sender: {
    _id: string;
    displayName: string;
    username: string;
    avatar: string;
    online: boolean;
  };
  channel: string;
  type: string;
  attachment?: ChatAttachment | null;
  createdAt: string;
}

export function useChat(channelId: string | null) {
  const { token } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());
  const [sendError, setSendError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const typingTimeouts = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const prevChannelRef = useRef<string | null>(null);

  // Load messages when channel changes
  useEffect(() => {
    if (!channelId || !token) return;

    setLoading(true);
    setMessages([]);

    api<ChatMessage[]>(`/channels/${channelId}/messages`, { token })
      .then(setMessages)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [channelId, token]);

  // Socket events
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !channelId) return;

    // Leave previous, join new
    if (prevChannelRef.current && prevChannelRef.current !== channelId) {
      socket.emit("channel:leave", prevChannelRef.current);
    }
    socket.emit("channel:join", channelId, (response?: { ok?: boolean; error?: string }) => {
      if (response?.ok === false && response.error) {
        setSendError(response.error);
      }
    });
    prevChannelRef.current = channelId;

    const handleNewMessage = (msg: ChatMessage) => {
      if (msg.channel === channelId) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    const handleTyping = (data: { userId: string; displayName: string }) => {
      setTypingUsers((prev) => {
        const next = new Map(prev);
        next.set(data.userId, data.displayName);
        return next;
      });

      // Clear previous timeout for this user
      const existing = typingTimeouts.current.get(data.userId);
      if (existing) clearTimeout(existing);

      // Auto-remove after 3 seconds
      const timeout = setTimeout(() => {
        setTypingUsers((prev) => {
          const next = new Map(prev);
          next.delete(data.userId);
          return next;
        });
      }, 3000);
      typingTimeouts.current.set(data.userId, timeout);
    };

    const handleStopTyping = (data: { userId: string }) => {
      setTypingUsers((prev) => {
        const next = new Map(prev);
        next.delete(data.userId);
        return next;
      });
    };

    socket.on("message:new", handleNewMessage);
    socket.on("message:typing", handleTyping);
    socket.on("message:stopTyping", handleStopTyping);

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("message:typing", handleTyping);
      socket.off("message:stopTyping", handleStopTyping);
    };
  }, [channelId]);

  const sendMessage = useCallback(
    (content: string, type = "text", attachment: ChatAttachment | null = null) => {
      const socket = getSocket();
      if (!socket || !channelId) return;
      if (!content.trim() && !attachment) return;
      setSendError(null);
      socket.emit(
        "message:send",
        { channelId, content, type, attachment },
        (response?: { ok?: boolean; error?: string }) => {
          if (response?.ok === false) {
            setSendError(response.error || "No se pudo enviar el mensaje");
          }
        }
      );
    },
    [channelId]
  );

  const uploadAndSendFile = useCallback(
    async (file: File) => {
      if (!token || !channelId) return;

      setSendError(null);
      setUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch(`${API_URL}/uploads/channel/${channelId}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "No se pudo subir el archivo");
        }

        sendMessage(data.suggestedText || file.name, data.suggestedType || "file", data.attachment);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error al subir archivo";
        setSendError(message);
      } finally {
        setUploading(false);
      }
    },
    [channelId, token, sendMessage]
  );

  const sendTyping = useCallback(() => {
    const socket = getSocket();
    if (!socket || !channelId) return;
    socket.emit("message:typing", { channelId });
  }, [channelId]);

  return {
    messages,
    loading,
    sendError,
    uploading,
    typingUsers: Array.from(typingUsers.values()),
    sendMessage,
    uploadAndSendFile,
    sendTyping,
  };
}
