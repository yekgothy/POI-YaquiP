import { io, Socket } from "socket.io-client";

const rawSocketBase =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API ||
  (typeof window !== "undefined" ? window.location.origin : "https://localhost:5173");

const pageProtocol = typeof window !== "undefined" ? window.location.protocol : "";
const configuredSocketBase = String(rawSocketBase)
  .trim()
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

const SOCKET_URL = pageProtocol === "https:" && /^http:\/\//i.test(configuredSocketBase)
  ? (typeof window !== "undefined" ? window.location.origin : "https://localhost:5173")
  : configuredSocketBase;

let socket: Socket | null = null;

export function connectSocket(token: string): Socket {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: { token },
  });

  socket.on("connect", () => {
    console.log("🔌 Socket connected:", socket?.id);
  });

  socket.on("connect_error", (err) => {
    console.error("Socket connection error:", err.message);
  });

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
