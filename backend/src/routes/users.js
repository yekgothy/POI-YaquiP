const express = require("express");
const db = require("../lib/db");
const auth = require("../middleware/auth");

const router = express.Router();

// GET /api/users — List all users (for member panel, DM search)
router.get("/", auth, async (req, res) => {
  try {
    const serverId = req.query.serverId ? String(req.query.serverId) : undefined;
    const users = await db.listOtherUsers(req.user._id, serverId);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users/:id/profile — Profile overview (with optional server stats)
router.get("/:id/profile", auth, async (req, res) => {
  try {
    const targetUserId = String(req.params.id);
    const serverId = req.query.serverId ? String(req.query.serverId) : undefined;

    if (serverId) {
      const viewerIsMember = await db.isServerMember(req.user._id, serverId);
      if (!viewerIsMember) {
        return res.status(403).json({ error: "No perteneces a este servidor" });
      }
    }

    const profile = await db.getUserProfileOverview(targetUserId, serverId);
    res.json(profile);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/users/profile — Update profile
router.put("/profile", auth, async (req, res) => {
  try {
    const allowed = ["displayName", "bio", "favoriteTeam", "country", "city", "avatar"];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const user = await db.updateUserProfile(req.user._id, updates);
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
