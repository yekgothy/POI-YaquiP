require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const db = require("./lib/db");

const authRoutes = require("./routes/auth");
const channelRoutes = require("./routes/channels");
const userRoutes = require("./routes/users");
const serverRoutes = require("./routes/servers");
const uploadRoutes = require("./routes/uploads");
const callRoutes = require("./routes/calls");
const setupSocket = require("./socket");
const seedChannels = require("./seed");

const app = express();
const server = http.createServer(app);

const allowedOrigins = (process.env.CLIENT_URLS || process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const isPrivateLanHost = (hostname) => {
  if (!hostname) return false;
  if (hostname === "localhost" || hostname === "127.0.0.1") return true;

  if (/^10\./.test(hostname)) return true;
  if (/^192\.168\./.test(hostname)) return true;

  const match172 = hostname.match(/^172\.(\d{1,3})\./);
  if (match172) {
    const secondOctet = Number(match172[1]);
    if (secondOctet >= 16 && secondOctet <= 31) return true;
  }

  return false;
};

const isAllowedOrigin = (origin) => {
  if (!origin) return true;

  if (allowedOrigins.includes(origin)) {
    return true;
  }

  try {
    const parsedOrigin = new URL(origin);
    const isValidProtocol = parsedOrigin.protocol === "http:" || parsedOrigin.protocol === "https:";
    const isDevFrontendPort = parsedOrigin.port === "5173";
    return isValidProtocol && isDevFrontendPort && isPrivateLanHost(parsedOrigin.hostname);
  } catch {
    return false;
  }
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ["GET", "POST"],
};

// Socket.io with CORS
const io = new Server(server, {
  cors: corsOptions,
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// REST API Routes
app.use("/api/auth", authRoutes);
app.use("/api/channels", channelRoutes);
app.use("/api/users", userRoutes);
app.use("/api/servers", serverRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/calls", callRoutes);
const gamificationRoutes = require("./routes/gamification");
app.use("/api/user", gamificationRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Socket.io
setupSocket(io);

// Connect to Supabase and start server
const PORT = process.env.PORT || 4000;

db
  .ping()
  .then(async () => {
    console.log("📦 Supabase connected");

    // Seed default channels
    await seedChannels();
    console.log("🌱 Channels seeded");

    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Supabase connection error:", err.message);
    process.exit(1);
  });
