// backend/src/routes/gamification.js
const express = require('express');
const router = express.Router();
const db = require('../lib/db'); // Debe ser tu conexión a la BD

// Utilidad para calcular nivel por XP
function calculateLevel(xp) {
  // Ejemplo simple: cada nivel requiere 1000 XP más que el anterior
  let level = 1;
  let required = 1000;
  let total = 0;
  while (xp >= total + required) {
    total += required;
    required = Math.floor(required * 1.2); // escala
    level++;
  }
  return level;
}

// Completar tarea
router.post('/complete-task', async (req, res) => {
  const { userId, serverId, taskId } = req.body;
  try {
    // 1. Verifica si ya está completada
    const completed = await db.oneOrNone(
      'SELECT 1 FROM task_completions WHERE user_id = $1 AND task_id = $2',
      [userId, taskId]
    );
    if (completed) return res.status(400).json({ error: 'Task already completed' });

    // 2. Marca como completada
    await db.none(
      'INSERT INTO task_completions (server_id, task_id, user_id) VALUES ($1, $2, $3)',
      [serverId, taskId, userId]
    );

    // 3. Obtén XP de la tarea
    const task = await db.one('SELECT xp, title FROM tasks WHERE id = $1', [taskId]);

    // 4. Actualiza progreso
    const progress = await db.oneOrNone(
      'SELECT * FROM server_user_progress WHERE server_id = $1 AND user_id = $2',
      [serverId, userId]
    );
    let newXP = (progress?.xp || 0) + task.xp;
    let newTasks = (progress?.tasks_completed || 0) + 1;
    let newLevel = calculateLevel(newXP);
    let now = new Date();
    // Racha: Si la última tarea fue ayer, suma, si no, reinicia
    let streak = 1;
    let maxStreak = progress?.max_streak || 1;
    if (progress?.last_task_at) {
      const last = new Date(progress.last_task_at);
      const diff = (now - last) / (1000 * 60 * 60 * 24);
      if (diff < 2 && diff >= 1) streak = (progress.current_streak || 0) + 1;
      else if (diff < 1) streak = progress.current_streak || 1;
    }
    if (streak > maxStreak) maxStreak = streak;
    await db.none(
      `UPDATE server_user_progress SET xp = $1, tasks_completed = $2, level = $3, last_task_at = $4, current_streak = $5, max_streak = $6, updated_at = $7 WHERE server_id = $8 AND user_id = $9`,
      [newXP, newTasks, newLevel, now, streak, maxStreak, now, serverId, userId]
    );

    // 5. Registrar actividad
    await db.none(
      `INSERT INTO user_activity_log (user_id, server_id, type, description) VALUES ($1, $2, $3, $4)`,
      [userId, serverId, 'task_completed', `Completó la tarea "${task.title}"`]
    );

    // 6. (Opcional) Desbloquear trofeos/insignias si aplica (ejemplo: 5 tareas)
    // Aquí puedes agregar lógica para consultar y asignar trofeos/insignias

    res.json({ success: true, newXP, newLevel, streak, maxStreak });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal error' });
  }
});


// Obtener progreso de usuario
router.get('/progress', async (req, res) => {
  const { userId, serverId } = req.query;
  if (!userId || !serverId) return res.status(400).json({ error: 'userId y serverId requeridos' });
  try {
    const progress = await db.oneOrNone(
      'SELECT * FROM server_user_progress WHERE server_id = $1 AND user_id = $2',
      [serverId, userId]
    );
    if (!progress) return res.status(404).json({ error: 'No hay progreso para este usuario' });
    res.json(progress);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal error' });
  }
});

module.exports = router;
