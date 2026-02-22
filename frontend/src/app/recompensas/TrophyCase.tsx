import type { Trophy } from "../tareas/types";

interface TrophyCaseProps {
  trophies: Trophy[];
}

const rarityConfig = {
  common: { label: "Común", color: "text-base-content/50", bg: "bg-base-300", ring: "" },
  rare: { label: "Raro", color: "text-info", bg: "bg-info/10", ring: "ring-2 ring-info/30" },
  epic: { label: "Épico", color: "text-secondary", bg: "bg-secondary/10", ring: "ring-2 ring-secondary/30" },
  legendary: { label: "Legendario", color: "text-warning", bg: "bg-warning/10", ring: "ring-2 ring-warning/30 shadow-lg shadow-warning/20" },
};

const defaultTrophies: Trophy[] = [
  { id: "1", name: "Primer Gol", description: "Completa tu primera misión", emoji: "⚽", rarity: "common", unlocked: true, unlockedAt: "Feb 20" },
  { id: "2", name: "Explorador", description: "Visita 3 sedes del Mundial", emoji: "🗺️", rarity: "rare", unlocked: true, unlockedAt: "Feb 18", progress: 3, maxProgress: 3 },
  { id: "3", name: "Cerebro Mundialista", description: "Aprueba 5 cuestionarios", emoji: "🧠", rarity: "rare", unlocked: false, progress: 3, maxProgress: 5 },
  { id: "4", name: "Racha de Fuego", description: "Completa misiones 7 días seguidos", emoji: "🔥", rarity: "epic", unlocked: true, unlockedAt: "Feb 15" },
  { id: "5", name: "Fotógrafo Estrella", description: "Sube 10 fotos verificadas", emoji: "📸", rarity: "epic", unlocked: false, progress: 6, maxProgress: 10 },
  { id: "6", name: "Balón de Oro", description: "Alcanza el nivel 25", emoji: "🏆", rarity: "legendary", unlocked: false, progress: 12, maxProgress: 25 },
  { id: "7", name: "Leyenda Social", description: "Invita 20 amigos a la plataforma", emoji: "🤝", rarity: "epic", unlocked: false, progress: 8, maxProgress: 20 },
  { id: "8", name: "Guante de Oro", description: "Responde 50 preguntas sin error", emoji: "🧤", rarity: "legendary", unlocked: false, progress: 23, maxProgress: 50 },
  { id: "9", name: "Debut", description: "Inicia sesión por primera vez", emoji: "👋", rarity: "common", unlocked: true, unlockedAt: "Feb 10" },
  { id: "10", name: "Coleccionista", description: "Desbloquea 10 trofeos", emoji: "👑", rarity: "legendary", unlocked: false, progress: 4, maxProgress: 10 },
  { id: "11", name: "Bota de Oro", description: "Acumula 5,000 XP", emoji: "👟", rarity: "epic", unlocked: false, progress: 2150, maxProgress: 5000 },
  { id: "12", name: "Hincha Fiel", description: "Usa la app durante 30 días", emoji: "🎺", rarity: "rare", unlocked: false, progress: 12, maxProgress: 30 },
];

export default function TrophyCase({ trophies = defaultTrophies }: TrophyCaseProps) {
  const unlocked = trophies.filter((t) => t.unlocked);
  const locked = trophies.filter((t) => !t.unlocked);

  return (
    <div className="space-y-6">
      {/* Desbloqueados */}
      <div>
        <h3 className="text-sm font-bold text-base-content/60 uppercase tracking-wider mb-3 flex items-center gap-2">
          🏆 Desbloqueados — {unlocked.length}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {unlocked.map((trophy) => {
            const r = rarityConfig[trophy.rarity];
            return (
              <div
                key={trophy.id}
                className={`${r.bg} ${r.ring} rounded-xl p-4 text-center transition-all hover:scale-105 cursor-pointer`}
              >
                <div className="text-4xl mb-2">{trophy.emoji}</div>
                <p className="font-bold text-sm text-base-content">{trophy.name}</p>
                <p className="text-[10px] text-base-content/40 mt-0.5">{trophy.description}</p>
                <div className="mt-2 flex items-center justify-center gap-1">
                  <span className={`text-[10px] font-semibold ${r.color}`}>{r.label}</span>
                  {trophy.unlockedAt && (
                    <span className="text-[10px] text-base-content/30">• {trophy.unlockedAt}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* En progreso / Bloqueados */}
      <div>
        <h3 className="text-sm font-bold text-base-content/60 uppercase tracking-wider mb-3 flex items-center gap-2">
          🔒 Por desbloquear — {locked.length}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {locked.map((trophy) => {
            const r = rarityConfig[trophy.rarity];
            const progressPct = trophy.progress && trophy.maxProgress
              ? Math.round((trophy.progress / trophy.maxProgress) * 100)
              : 0;

            return (
              <div
                key={trophy.id}
                className="bg-base-200 rounded-xl p-4 text-center transition-all hover:bg-base-300/50 cursor-pointer"
              >
                <div className="text-4xl mb-2 grayscale opacity-40">{trophy.emoji}</div>
                <p className="font-bold text-sm text-base-content/60">{trophy.name}</p>
                <p className="text-[10px] text-base-content/30 mt-0.5">{trophy.description}</p>
                <span className={`text-[10px] font-semibold ${r.color} block mt-1`}>{r.label}</span>
                {trophy.progress !== undefined && trophy.maxProgress !== undefined && (
                  <div className="mt-2">
                    <progress
                      className="progress progress-primary w-full h-1.5"
                      value={progressPct}
                      max={100}
                    />
                    <p className="text-[10px] text-base-content/30 mt-0.5">
                      {trophy.progress} / {trophy.maxProgress}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
