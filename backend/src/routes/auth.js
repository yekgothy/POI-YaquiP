const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../lib/db");
const auth = require("../middleware/auth");

const router = express.Router();

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { displayName, username, email, password } = req.body;

    // Check if user already exists
    const existing = await db.findExistingByEmailOrUsername(email, username);
    if (existing) {
      return res.status(400).json({ error: `Ese ${existing.field} ya está en uso` });
    }

    const user = await db.createUser({ displayName, username, email, password });
    await db.ensureUserInDefaultServer(user._id);
    await db.ensureDefaultChannelsForServer(db.DEFAULT_SERVER_ID);

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({ user, token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await db.compareUserPassword(email, password);
    if (!user) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    await db.ensureUserInDefaultServer(user._id);
    await db.ensureDefaultChannelsForServer(db.DEFAULT_SERVER_ID);

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me — Get current user
router.get("/me", auth, async (req, res) => {
  res.json(req.user);
});

module.exports = router;
