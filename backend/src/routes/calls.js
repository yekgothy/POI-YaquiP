const express = require("express");
const router = express.Router();
const db = require("../lib/db");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Middleware para autenticar
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

// POST /start - Iniciar una nueva llamada
router.post("/start", authMiddleware, async (req, res) => {
  try {
    const { channelId, callType = "group", targetUserId } = req.body;
    const initiatedBy = req.userId;

    if (!channelId && !targetUserId) {
      return res
        .status(400)
        .json({ error: "channelId or targetUserId required" });
    }

    // Generar nombre único para la sala
    const roomName = `call_${crypto.randomBytes(12).toString("hex")}`;

    // Obtener info del usuario que inicia
    const user = await db.findUserById(initiatedBy);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Crear registro de llamada
    const callData = {
      room_name: roomName,
      initiated_by: initiatedBy,
      channel_id: channelId || null,
      call_type: callType || "group",
      status: "active",
      started_at: new Date(),
    };

    const callId = await db.createCall(callData);

    // Agregar initiador como participante
    await db.addCallParticipant(callId, initiatedBy);

    res.json({
      ok: true,
      callId,
      roomName,
      callType,
      user: {
        id: user._id || user.id,
        displayName: user.display_name || user.displayName,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Error starting call:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST /join - Unirse a una llamada existente
router.post("/join", authMiddleware, async (req, res) => {
  try {
    const { callId } = req.body;
    const userId = req.userId;

    if (!callId) {
      return res.status(400).json({ error: "callId required" });
    }

    // Verificar que la llamada existe y está activa
    const call = await db.getCallById(callId);
    if (!call) {
      return res.status(404).json({ error: "Call not found" });
    }

    if (call.status !== "active") {
      return res.status(400).json({ error: "Call is not active" });
    }

    // Agregar usuario como participante
    await db.addCallParticipant(callId, userId);

    const user = await db.findUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      ok: true,
      callId,
      roomName: call.room_name,
      callType: call.call_type,
      user: {
        id: user._id || user.id,
        displayName: user.display_name || user.displayName,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Error joining call:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST /end - Terminar una llamada
router.post("/end", authMiddleware, async (req, res) => {
  try {
    const { callId } = req.body;
    const userId = req.userId;

    if (!callId) {
      return res.status(400).json({ error: "callId required" });
    }

    // Obtener info de la llamada
    const call = await db.getCallById(callId);
    if (!call) {
      return res.status(404).json({ error: "Call not found" });
    }

    // Calcular duración
    const startTime = new Date(call.started_at);
    const endTime = new Date();
    const durationSeconds = Math.floor((endTime - startTime) / 1000);

    // Actualizar llamada
    await db.endCall(callId, durationSeconds);

    // Actualizar participante que se va
    await db.updateParticipantLeaveTime(callId, userId);

    res.json({ ok: true, durationSeconds });
  } catch (error) {
    console.error("Error ending call:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /history - Obtener historial de llamadas
router.get("/history", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { limit = 20, offset = 0 } = req.query;

    const history = await db.getCallHistory(userId, parseInt(limit), parseInt(offset));

    res.json({ ok: true, calls: history });
  } catch (error) {
    console.error("Error fetching call history:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /:callId - Obtener detalles de una llamada
router.get("/:callId", authMiddleware, async (req, res) => {
  try {
    const { callId } = req.params;

    const call = await db.getCallById(callId);
    if (!call) {
      return res.status(404).json({ error: "Call not found" });
    }

    const participants = await db.getCallParticipants(callId);

    res.json({
      ok: true,
      call: {
        ...call,
        participants,
      },
    });
  } catch (error) {
    console.error("Error fetching call:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
