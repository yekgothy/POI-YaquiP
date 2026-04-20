import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { getSocket } from "../lib/socket";
import { useAuth } from "../context/AuthContext";

export interface OnlineUser {
  _id: string;
  displayName: string;
  username: string;
  avatar: string;
  online: boolean;
}

export function useOnlineUsers() {
  const { token } = useAuth();
  const [users, setUsers] = useState<OnlineUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all users from API
  useEffect(() => {
    if (!token) return;
    api<OnlineUser[]>("/users", { token })
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  // Listen for real-time online/offline events
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleUserOnline = (data: {
      userId: string;
      displayName: string;
      username: string;
      avatar: string;
      online: boolean;
    }) => {
      setUsers((prev) => {
        const exists = prev.find((u) => u._id === data.userId);
        if (exists) {
          // Update existing user's online status
          return prev.map((u) =>
            u._id === data.userId ? { ...u, online: data.online } : u
          );
        }
        // New user just connected — add them
        if (data.online) {
          return [
            ...prev,
            {
              _id: data.userId,
              displayName: data.displayName,
              username: data.username,
              avatar: data.avatar,
              online: true,
            },
          ];
        }
        return prev;
      });
    };

    socket.on("user:online", handleUserOnline);
    return () => {
      socket.off("user:online", handleUserOnline);
    };
  }, []);

  const onlineUsers = users.filter((u) => u.online);
  const offlineUsers = users.filter((u) => !u.online);

  return { users, onlineUsers, offlineUsers, loading };
}
