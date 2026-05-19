const express = require("express");
const db = require("../lib/db");
const auth = require("../middleware/auth");

const router = express.Router();

// GET /api/channels — List channels for a team
router.get("/", auth, async (req, res) => {
  try {
    const { team } = req.query;
    const channels = await db.listChannels(team);
    res.json(channels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/channels/dms — List DM channels for current user
router.get("/dms", auth, async (req, res) => {
  try {
    const channels = await db.listDMChannelsForUser(req.user._id);
    res.json(channels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/channels/unread-summary — unread counters for current user
router.get("/unread-summary", auth, async (req, res) => {
  try {
    const summary = await db.getUnreadCountsForUser(req.user._id);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/channels/dm — Start or get DM with a user
router.post("/dm", auth, async (req, res) => {
  try {
    const { targetUserId } = req.body;

    // Check if DM already exists between these two users
    let channel = await db.findExistingDMChannel(req.user._id, targetUserId);

    if (!channel) {
      channel = await db.createDMChannel(req.user._id, targetUserId);
    }

    res.json(channel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/channels/:id/messages — Get messages for a channel
router.get("/:id/messages", auth, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const before = req.query.before; // cursor-based pagination
    const messages = await db.listMessages(req.params.id, limit, before);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/channels/:id/read — mark a channel as read
router.post("/:id/read", auth, async (req, res) => {
  try {
    await db.markChannelRead(req.user._id, req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
