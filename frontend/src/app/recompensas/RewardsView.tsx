import { useState } from "react";
import TrophyCase from "./TrophyCase";
import Leaderboard from "./Leaderboard";
import UserAvatar from "../components/UserAvatar";

type Tab = "trophies" | "leaderboard";

export default function RewardsView() {
  const [tab, setTab] = useState<Tab>("trophies");

  // Mock user stats
  const level = 12;
  const xp = 4200;
  const xpToNext = 5000;
  const xpProgress = Math.round((xp / xpToNext) * 100);
  const streak = 5;

  return (
    <div className="h-full overflow-y-auto">
      {/* Profile hero */}
      <div className="bg-gradient-to-br from-warning/10 via-primary/5 to-secondary/10 px-6 py-8 border-b border-base-300">
        <div className="flex items-center gap-5 mb-6">
          <div className="relative">
            <div className="absolute -inset-1.5 bg-gradient-to-br from-warning to-primary rounded-full opacity-30 blur-sm" />
            <UserAvatar name="Tú" size="xl" online={true} />
            {/* Level badge */}
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-warning text-warning-content flex items-center justify-center text-xs font-extrabold ring-2 ring-base-100">
              {level}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-extrabold text-base-content">Usuario</h2>
            <p className="text-sm text-base-content/50">Nivel {level} • Rango #5</p>

            {/* XP bar */}
            <div className="mt-3 w-full max-w-xs">
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-base-content/40">XP</span>
                <span className="font-bold text-warning">{xp.toLocaleString()} / {xpToNext.toLocaleString()}</span>
              </div>
              <progress className="progress progress-warning w-full h-2.5" value={xpProgress} max={100} />
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-base-100/80 backdrop-blur rounded-xl p-3 text-center shadow-sm">
            <p className="text-2xl font-extrabold text-primary">16</p>
            <p className="text-[10px] text-base-content/40">Misiones</p>
          </div>
          <div className="bg-base-100/80 backdrop-blur rounded-xl p-3 text-center shadow-sm">
            <p className="text-2xl font-extrabold text-success">4</p>
            <p className="text-[10px] text-base-content/40">Trofeos</p>
          </div>
          <div className="bg-base-100/80 backdrop-blur rounded-xl p-3 text-center shadow-sm">
            <p className="text-2xl font-extrabold text-warning">🔥 {streak}</p>
            <p className="text-[10px] text-base-content/40">Racha</p>
          </div>
          <div className="bg-base-100/80 backdrop-blur rounded-xl p-3 text-center shadow-sm">
            <p className="text-2xl font-extrabold text-info">#5</p>
            <p className="text-[10px] text-base-content/40">Ranking</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-4">
        <div className="flex gap-1 bg-base-200 rounded-lg p-1 w-fit">
          <button
            onClick={() => setTab("trophies")}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
              tab === "trophies"
                ? "bg-base-100 text-primary shadow-sm"
                : "text-base-content/50 hover:text-base-content"
            }`}
          >
            🏆 Trofeos
          </button>
          <button
            onClick={() => setTab("leaderboard")}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
              tab === "leaderboard"
                ? "bg-base-100 text-primary shadow-sm"
                : "text-base-content/50 hover:text-base-content"
            }`}
          >
            📊 Tabla de posiciones
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {tab === "trophies" && <TrophyCase trophies={[]} />}
        {tab === "leaderboard" && <Leaderboard />}
      </div>
    </div>
  );
}
