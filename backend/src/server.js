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

// Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
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
