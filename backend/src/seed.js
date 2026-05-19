const db = require("./lib/db");

async function seedChannels() {
  await db.ensureDefaultServerExists();
  await db.ensureDefaultChannelsForServer(db.DEFAULT_SERVER_ID);
}

module.exports = seedChannels;
