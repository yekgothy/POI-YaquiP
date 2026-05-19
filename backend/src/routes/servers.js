const express = require("express");
const auth = require("../middleware/auth");
const db = require("../lib/db");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const servers = await db.listServersForUser(req.user._id);
    res.json(servers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/discover", auth, async (req, res) => {
  try {
    const q = req.query.q ? String(req.query.q).trim() : "";
    const servers = await db.discoverServersForUser(req.user._id, q);
    res.json(servers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:serverId/join", auth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const server = await db.joinServer(req.user._id, serverId);
    res.json(server);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const name = String(req.body?.name || "").trim();
    const description = String(req.body?.description || "").trim();
    if (!name) return res.status(400).json({ error: "El nombre del servidor es obligatorio" });
    if (name.length > 64) return res.status(400).json({ error: "Nombre de servidor demasiado largo" });
    if (description.length > 240) {
      return res.status(400).json({ error: "Descripción de servidor demasiado larga" });
    }

    const server = await db.createServer({ name, description, creatorId: req.user._id });
    await db.ensureDefaultChannelsForServer(server._id);
    res.status(201).json(server);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/:serverId/admin/settings", auth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const isAdmin = await db.isServerAdmin(req.user._id, serverId);
    if (!isAdmin) return res.status(403).json({ error: "Solo admins pueden editar el servidor" });

    const name = req.body?.name !== undefined ? String(req.body.name).trim() : undefined;
    const description =
      req.body?.description !== undefined ? String(req.body.description).trim() : undefined;
    const visibility =
      req.body?.visibility !== undefined ? String(req.body.visibility).trim() : undefined;

    if (name !== undefined && !name) {
      return res.status(400).json({ error: "El nombre del servidor es obligatorio" });
    }
    if (name && name.length > 64) {
      return res.status(400).json({ error: "Nombre de servidor demasiado largo" });
    }
    if (description && description.length > 240) {
      return res.status(400).json({ error: "Descripción de servidor demasiado larga" });
    }
    if (visibility && !["public", "private"].includes(visibility)) {
      return res.status(400).json({ error: "Visibilidad inválida" });
    }

    const server = await db.updateServerSettings(serverId, { name, description, visibility });
    res.json(server);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/:serverId/admin/channels", auth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const isAdmin = await db.isServerAdmin(req.user._id, serverId);
    if (!isAdmin) return res.status(403).json({ error: "Solo admins pueden gestionar canales" });

    const channels = await db.listServerChannels(serverId);
    res.json(channels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:serverId/admin/channels", auth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const isAdmin = await db.isServerAdmin(req.user._id, serverId);
    if (!isAdmin) return res.status(403).json({ error: "Solo admins pueden crear canales" });

    const name = String(req.body?.name || "").trim();
    const type = String(req.body?.type || "text").trim();
    const description = String(req.body?.description || "").trim();
    if (!name) return res.status(400).json({ error: "El nombre del canal es obligatorio" });
    if (!["text", "voice", "video"].includes(type)) {
      return res.status(400).json({ error: "Tipo de canal inválido" });
    }

    const channel = await db.createServerChannel(serverId, { name, type, description });
    res.status(201).json(channel);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:serverId/admin/channels/:channelId", auth, async (req, res) => {
  try {
    const { serverId, channelId } = req.params;
    const isAdmin = await db.isServerAdmin(req.user._id, serverId);
    if (!isAdmin) return res.status(403).json({ error: "Solo admins pueden eliminar canales" });

    const channels = await db.listServerChannels(serverId);
    const textChannels = channels.filter((c) => c.type === "text");
    const target = channels.find((c) => c._id === channelId);
    if (!target) return res.status(404).json({ error: "Canal no encontrado" });
    if (target.type === "text" && textChannels.length <= 1) {
      return res.status(400).json({ error: "Debe existir al menos un canal de texto" });
    }

    await db.deleteServerChannel(serverId, channelId);
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/:serverId/admin/members", auth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const isAdmin = await db.isServerAdmin(req.user._id, serverId);
    if (!isAdmin) return res.status(403).json({ error: "Solo admins pueden gestionar miembros" });

    const members = await db.listServerMembers(serverId);
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:serverId/admin/members/:userId", auth, async (req, res) => {
  try {
    const { serverId, userId } = req.params;
    const isAdmin = await db.isServerAdmin(req.user._id, serverId);
    if (!isAdmin) return res.status(403).json({ error: "Solo admins pueden expulsar miembros" });
    if (userId === req.user._id) {
      return res.status(400).json({ error: "No puedes expulsarte a ti mismo" });
    }

    const isTargetAdmin = await db.isServerAdmin(userId, serverId);
    if (isTargetAdmin) {
      return res.status(400).json({ error: "No puedes expulsar a otro administrador" });
    }

    await db.removeServerMember(serverId, userId);
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/:serverId/tasks", auth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const isMember = await db.isServerMember(req.user._id, serverId);
    if (!isMember) return res.status(403).json({ error: "No perteneces a este servidor" });

    const tasks = await db.listTasksForServer(serverId, req.user._id, false);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:serverId/tasks/:taskId/complete", auth, async (req, res) => {
  try {
    const { serverId, taskId } = req.params;
    const isMember = await db.isServerMember(req.user._id, serverId);
    if (!isMember) return res.status(403).json({ error: "No perteneces a este servidor" });

    const result = await db.completeTask(serverId, taskId, req.user._id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/:serverId/progress", auth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const isMember = await db.isServerMember(req.user._id, serverId);
    if (!isMember) return res.status(403).json({ error: "No perteneces a este servidor" });

    const progress = await db.getServerProgress(serverId, req.user._id);
    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:serverId/rewards", auth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const isMember = await db.isServerMember(req.user._id, serverId);
    if (!isMember) return res.status(403).json({ error: "No perteneces a este servidor" });

    const rewards = await db.listRewardsForUser(serverId, req.user._id);
    res.json(rewards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:serverId/rewards/:rewardId/redeem", auth, async (req, res) => {
  try {
    const { serverId, rewardId } = req.params;
    const isMember = await db.isServerMember(req.user._id, serverId);
    if (!isMember) return res.status(403).json({ error: "No perteneces a este servidor" });

    const result = await db.redeemReward(serverId, req.user._id, rewardId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/:serverId/admin/tasks", auth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const isAdmin = await db.isServerAdmin(req.user._id, serverId);
    if (!isAdmin) return res.status(403).json({ error: "Solo admins pueden ver esta sección" });

    const tasks = await db.listTasksForServer(serverId, req.user._id, true);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:serverId/admin/rewards", auth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const isAdmin = await db.isServerAdmin(req.user._id, serverId);
    if (!isAdmin) return res.status(403).json({ error: "Solo admins pueden gestionar premios" });

    const rewards = await db.listRewardsForAdmin(serverId);
    res.json(rewards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:serverId/admin/rewards", auth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const isAdmin = await db.isServerAdmin(req.user._id, serverId);
    if (!isAdmin) return res.status(403).json({ error: "Solo admins pueden crear premios" });

    const name = String(req.body?.name || "").trim();
    const description = String(req.body?.description || "").trim();
    const rewardType = String(req.body?.rewardType || "badge").trim();
    const rewardValue = String(req.body?.rewardValue || "").trim();
    const costPoints = Number(req.body?.costPoints || 0);

    if (!name) return res.status(400).json({ error: "El nombre del premio es obligatorio" });
    if (!["badge", "title", "item"].includes(rewardType)) {
      return res.status(400).json({ error: "Tipo de premio inválido" });
    }
    if (!Number.isFinite(costPoints) || costPoints < 0) {
      return res.status(400).json({ error: "Costo de puntos inválido" });
    }

    const reward = await db.createReward(serverId, {
      name,
      description,
      rewardType,
      rewardValue,
      costPoints,
      active: true,
    });
    res.status(201).json(reward);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:serverId/admin/rewards/:rewardId", auth, async (req, res) => {
  try {
    const { serverId, rewardId } = req.params;
    const isAdmin = await db.isServerAdmin(req.user._id, serverId);
    if (!isAdmin) return res.status(403).json({ error: "Solo admins pueden eliminar premios" });

    await db.deleteReward(serverId, rewardId);
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/:serverId/admin/tasks", auth, async (req, res) => {
  try {
    const { serverId } = req.params;
    const isAdmin = await db.isServerAdmin(req.user._id, serverId);
    if (!isAdmin) return res.status(403).json({ error: "Solo admins pueden crear tareas" });

    const task = await db.createTask(serverId, req.user._id, req.body || {});
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/:serverId/admin/tasks/:taskId", auth, async (req, res) => {
  try {
    const { serverId, taskId } = req.params;
    const isAdmin = await db.isServerAdmin(req.user._id, serverId);
    if (!isAdmin) return res.status(403).json({ error: "Solo admins pueden editar tareas" });

    const task = await db.updateTask(serverId, taskId, req.body || {});
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.patch("/:serverId/admin/tasks/:taskId/active", auth, async (req, res) => {
  try {
    const { serverId, taskId } = req.params;
    const isAdmin = await db.isServerAdmin(req.user._id, serverId);
    if (!isAdmin) return res.status(403).json({ error: "Solo admins pueden activar/desactivar tareas" });

    const task = await db.setTaskActive(serverId, taskId, !!req.body?.active);
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:serverId/admin/tasks/:taskId", auth, async (req, res) => {
  try {
    const { serverId, taskId } = req.params;
    const isAdmin = await db.isServerAdmin(req.user._id, serverId);
    if (!isAdmin) return res.status(403).json({ error: "Solo admins pueden eliminar tareas" });

    await db.deleteTask(serverId, taskId);
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
