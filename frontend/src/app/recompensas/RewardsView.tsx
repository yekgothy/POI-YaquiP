import { useEffect, useMemo, useState } from "react";
import TrophyCase from "./TrophyCase";
import Leaderboard from "./Leaderboard.tsx";
import UserAvatar from "../components/UserAvatar";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import type { Trophy } from "../tareas/types";

type Tab = "trophies" | "leaderboard" | "shop";

interface RewardsViewProps {
  serverId: string | null;
  serverName: string;
}

interface ProgressResponse {
  stats: {
    level: number;
    xp: number;
    points: number;
    tasksCompleted: number;
    rank: number;
    xpToNext: number;
  };
  leaderboard: Array<{
    rank: number;
    userId: string;
    name: string;
    xp: number;
    level: number;
    tasksCompleted: number;
    isYou?: boolean;
  }>;
}

interface RewardItem {
  id: string;
  name: string;
  description: string;
  costPoints: number;
  rewardType: "badge" | "title" | "item";
  rewardValue: string;
  owned: boolean;
}

interface RewardsResponse {
  points: number;
  rewards: RewardItem[];
}

export default function RewardsView({ serverId, serverName }: RewardsViewProps) {
  const { token, user } = useAuth();
  const [tab, setTab] = useState<Tab>("trophies");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<ProgressResponse | null>(null);
  const [rewards, setRewards] = useState<RewardsResponse | null>(null);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [toastError, setToastError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !serverId) {
      setProgress(null);
      setRewards(null);
      return;
    }

    setLoading(true);
    Promise.all([
      api<ProgressResponse>(`/servers/${serverId}/progress`, { token }),
      api<RewardsResponse>(`/servers/${serverId}/rewards`, { token }),
    ])
      .then(([progressData, rewardsData]) => {
        setProgress(progressData);
        setRewards(rewardsData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token, serverId]);

  useEffect(() => {
    if (!toastError) return;
    const timer = window.setTimeout(() => setToastError(null), 2500);
    return () => window.clearTimeout(timer);
  }, [toastError]);

  const handleRedeem = async (rewardId: string) => {
    if (!token || !serverId) return;
    setRedeemingId(rewardId);
    try {
      await api(`/servers/${serverId}/rewards/${rewardId}/redeem`, {
        token,
        method: "POST",
      });
      const [progressData, rewardsData] = await Promise.all([
        api<ProgressResponse>(`/servers/${serverId}/progress`, { token }),
        api<RewardsResponse>(`/servers/${serverId}/rewards`, { token }),
      ]);
      setProgress(progressData);
      setRewards(rewardsData);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "No se pudo canjear el premio";
      setToastError(msg);
    } finally {
      setRedeemingId(null);
    }
  };

  const trophies = useMemo<Trophy[]>(() => {
    const owned = rewards?.rewards.filter((r) => r.owned) || [];
    return owned.map((reward) => {
      const rarity: Trophy["rarity"] =
        reward.costPoints >= 1200
          ? "legendary"
          : reward.costPoints >= 700
          ? "epic"
          : reward.costPoints >= 300
          ? "rare"
          : "common";

      return {
        id: reward.id,
        name: reward.name,
        description: reward.description,
        emoji: reward.rewardValue || "🏅",
        rarity,
        unlocked: true,
      };
    });
  }, [rewards]);

  if (!serverId) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <p className="text-base-content/60">Selecciona un servidor para ver recompensas</p>
      </div>
    );
  }

  const level = progress?.stats.level || 1;
  const xp = progress?.stats.xp || 0;
  const xpToNext = progress?.stats.xpToNext || 120;
  const xpProgress = Math.max(0, Math.min(100, Math.round((xp / xpToNext) * 100)));
  const rank = progress?.stats.rank || 0;
  const tasksCompleted = progress?.stats.tasksCompleted || 0;
  const points = rewards?.points ?? progress?.stats.points ?? 0;

  return (
    <div className="h-full overflow-y-auto">
      {toastError && (
        <div className="fixed top-4 right-4 z-50">
          <div className="alert alert-error shadow-lg">
            <span>{toastError}</span>
          </div>
        </div>
      )}

      {/* Profile hero */}
      <div className="bg-linear-to-br from-warning/10 via-primary/5 to-secondary/10 px-6 py-8 border-b border-base-300">
        <div className="flex items-center gap-5 mb-6">
          <div className="relative">
            <div className="absolute -inset-1.5 bg-linear-to-br from-warning to-primary rounded-full opacity-30 blur-sm" />
            <UserAvatar name={user?.displayName || user?.username || "Tú"} size="xl" online={true} />
            {/* Level badge */}
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-warning text-warning-content flex items-center justify-center text-xs font-extrabold ring-2 ring-base-100">
              {level}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-extrabold text-base-content">{user?.displayName || user?.username || "Usuario"}</h2>
            <p className="text-sm text-base-content/50">{serverName} • Nivel {level} • Rango #{rank || "-"}</p>

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
            <p className="text-2xl font-extrabold text-primary">{tasksCompleted}</p>
            <p className="text-[10px] text-base-content/40">Misiones</p>
          </div>
          <div className="bg-base-100/80 backdrop-blur rounded-xl p-3 text-center shadow-sm">
            <p className="text-2xl font-extrabold text-success">{trophies.length}</p>
            <p className="text-[10px] text-base-content/40">Trofeos</p>
          </div>
          <div className="bg-base-100/80 backdrop-blur rounded-xl p-3 text-center shadow-sm">
            <p className="text-2xl font-extrabold text-warning">{points}</p>
            <p className="text-[10px] text-base-content/40">Puntos</p>
          </div>
          <div className="bg-base-100/80 backdrop-blur rounded-xl p-3 text-center shadow-sm">
            <p className="text-2xl font-extrabold text-info">#{rank || "-"}</p>
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
            <span className="inline-flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v-1.5a.75.75 0 0 0-.75-.75h-7.5a.75.75 0 0 0-.75.75V6m9 0h1.5a1.5 1.5 0 0 1 1.5 1.5V9a4.5 4.5 0 0 1-4.5 4.5H15M7.5 6H6A1.5 1.5 0 0 0 4.5 7.5V9A4.5 4.5 0 0 0 9 13.5h.75m-.75 0V15A2.25 2.25 0 0 0 11.25 17.25h1.5A2.25 2.25 0 0 0 15 15v-1.5M9 21h6" />
              </svg>
              Trofeos
            </span>
          </button>
          <button
            onClick={() => setTab("leaderboard")}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
              tab === "leaderboard"
                ? "bg-base-100 text-primary shadow-sm"
                : "text-base-content/50 hover:text-base-content"
            }`}
          >
            <span className="inline-flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5h4.5V21H3v-7.5Zm6.75-6h4.5V21h-4.5V7.5Zm6.75 3h4.5V21h-4.5v-10.5Z" />
              </svg>
              Tabla de posiciones
            </span>
          </button>
          <button
            onClick={() => setTab("shop")}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
              tab === "shop"
                ? "bg-base-100 text-primary shadow-sm"
                : "text-base-content/50 hover:text-base-content"
            }`}
          >
            <span className="inline-flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.75h16.5v9.75a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V9.75Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.75h16.5M12 9.75V21M7.5 9.75V7.5a2.25 2.25 0 1 1 4.5 0v2.25m0 0V7.5a2.25 2.25 0 1 1 4.5 0v2.25" />
              </svg>
              Tienda
            </span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading && (
          <div className="flex justify-center py-8">
            <span className="loading loading-dots loading-md text-primary" />
          </div>
        )}

        {!loading && tab === "trophies" && <TrophyCase trophies={trophies} />}
        {!loading && tab === "leaderboard" && (
          <Leaderboard entries={progress?.leaderboard || []} />
        )}
        {!loading && tab === "shop" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(rewards?.rewards || []).map((reward) => {
              const canBuy = !reward.owned && points >= reward.costPoints;
              return (
                <div key={reward.id} className="card bg-base-100 border border-base-300">
                  <div className="card-body">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="card-title text-base">{reward.name}</h3>
                        <p className="text-sm text-base-content/60">{reward.description}</p>
                      </div>
                      <span className="badge badge-warning">{reward.costPoints} pts</span>
                    </div>

                    <div className="card-actions justify-end">
                      {reward.owned ? (
                        <span className="badge badge-success">Canjeado</span>
                      ) : (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleRedeem(reward.id)}
                          disabled={!canBuy || redeemingId === reward.id}
                        >
                          {redeemingId === reward.id ? "Canjeando..." : "Canjear"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
