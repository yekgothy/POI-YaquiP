const express = require("express");
const multer = require("multer");
const auth = require("../middleware/auth");
const db = require("../lib/db");
const { supabase } = require("../lib/supabase");

const router = express.Router();

const CHAT_BUCKET = process.env.SUPABASE_CHAT_BUCKET || "chat-media";
const AVATAR_BUCKET = process.env.SUPABASE_AVATAR_BUCKET || "avatars";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});

function sanitizeFileName(fileName) {
  return String(fileName || "archivo")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .slice(-80);
}

function mediaTypeFromMime(mimeType) {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  return "file";
}

function ensureSingleFile(req, res, next) {
  upload.single("file")(req, res, (err) => {
    if (!err) return next();

    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "El archivo excede el limite de 50MB" });
    }

    return res.status(400).json({ error: err.message || "No se pudo procesar el archivo" });
  });
}

async function uploadBufferToBucket(bucket, path, file) {
  const result = await supabase.storage.from(bucket).upload(path, file.buffer, {
    contentType: file.mimetype,
    upsert: false,
  });

  if (result.error) {
    throw new Error(result.error.message || "No se pudo subir el archivo");
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return {
    path,
    url: data.publicUrl,
  };
}

router.post("/channel/:channelId", auth, ensureSingleFile, async (req, res) => {
  try {
    const { channelId } = req.params;
    const canAccess = await db.canUserAccessChannel(req.user._id, channelId);
    if (!canAccess) {
      return res.status(403).json({ error: "No tienes acceso a este canal" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Selecciona un archivo" });
    }

    const safeName = sanitizeFileName(req.file.originalname);
    const storagePath = `channels/${channelId}/${req.user._id}/${Date.now()}-${safeName}`;
    const uploaded = await uploadBufferToBucket(CHAT_BUCKET, storagePath, req.file);

    const attachment = {
      bucket: CHAT_BUCKET,
      path: uploaded.path,
      url: uploaded.url,
      name: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
    };

    res.json({
      attachment,
      suggestedType: mediaTypeFromMime(req.file.mimetype),
      suggestedText: req.file.originalname,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/avatar", auth, ensureSingleFile, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Selecciona una imagen" });
    }

    if (!req.file.mimetype.startsWith("image/")) {
      return res.status(400).json({ error: "El avatar debe ser una imagen" });
    }

    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ error: "El avatar excede el limite de 5MB" });
    }

    const ext = req.file.originalname.includes(".")
      ? req.file.originalname.split(".").pop().toLowerCase()
      : "jpg";
    const storagePath = `users/${req.user._id}/avatar-${Date.now()}.${ext}`;
    const uploaded = await uploadBufferToBucket(AVATAR_BUCKET, storagePath, req.file);

    const user = await db.updateUserProfile(req.user._id, { avatar: uploaded.url });

    res.json({
      avatarUrl: uploaded.url,
      user,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
