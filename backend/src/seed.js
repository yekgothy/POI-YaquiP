const mongoose = require("mongoose");
const Channel = require("./models/Channel");

const defaultChannels = [
  // Mundial 2026
  { name: "general", type: "text", team: "mundial-2026" },
  { name: "alineaciones", type: "text", team: "mundial-2026" },
  { name: "resultados", type: "text", team: "mundial-2026" },
  { name: "predicciones", type: "text", team: "mundial-2026" },
  { name: "tribuna-voz", type: "voice", team: "mundial-2026" },
  { name: "transmisión", type: "video", team: "mundial-2026" },
  // Grupo A
  { name: "general", type: "text", team: "grupo-a" },
  { name: "estrategia", type: "text", team: "grupo-a" },
  { name: "sala-voz", type: "voice", team: "grupo-a" },
  { name: "reunión", type: "video", team: "grupo-a" },
  // Staff
  { name: "anuncios", type: "text", team: "staff" },
  { name: "coordinación", type: "text", team: "staff" },
  { name: "privado-voz", type: "voice", team: "staff" },
];

async function seedChannels() {
  for (const ch of defaultChannels) {
    const exists = await Channel.findOne({ name: ch.name, team: ch.team });
    if (!exists) {
      await Channel.create(ch);
      console.log(`  ✅ Created channel: ${ch.team}/${ch.name}`);
    }
  }
}

module.exports = seedChannels;
