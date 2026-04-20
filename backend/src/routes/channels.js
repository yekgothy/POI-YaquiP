const express = require("express");
const Channel = require("../models/Channel");
const Message = require("../models/Message");
const auth = require("../middleware/auth");

const router = express.Router();

// GET /api/channels — List channels for a team
router.get("/", auth, async (req, res) => {
  try {
    const { team } = req.query;
    const filter = team ? { team, isDM: false } : { isDM: false };
    const channels = await Channel.find(filter).sort({ name: 1 });
    res.json(channels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/channels/dms — List DM channels for current user
router.get("/dms", auth, async (req, res) => {
  try {
    const channels = await Channel.find({
      isDM: true,
      members: req.user._id,
    }).populate("members", "displayName username online avatar");
    res.json(channels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/channels/dm — Start or get DM with a user
router.post("/dm", auth, async (req, res) => {
  try {
    const { targetUserId } = req.body;

    // Check if DM already exists between these two users
    let channel = await Channel.findOne({
      isDM: true,
      members: { $all: [req.user._id, targetUserId] },
    }).populate("members", "displayName username online avatar");

    if (!channel) {
      channel = new Channel({
        name: "DM",
        type: "dm",
        team: "dms",
        isDM: true,
        members: [req.user._id, targetUserId],
      });
      await channel.save();
      channel = await channel.populate("members", "displayName username online avatar");
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

    const filter = { channel: req.params.id };
    if (before) {
      filter.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("sender", "displayName username avatar online");

    // Return in chronological order
    res.json(messages.reverse());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
