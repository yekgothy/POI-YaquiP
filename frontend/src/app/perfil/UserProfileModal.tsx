import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import UserProfileView from "./UserProfileView";
import type { UserProfile } from "./types";

interface UserProfileModalProps {
  userId: string | null;
  serverId?: string | null;
  onClose: () => void;
}

interface ApiProfileOverview {
  user: {
    _id: string;
    displayName: string;
    username: string;
    email: string;
    avatar: string;
    bio: string;
    favoriteTeam: string;
    country: string;
    city: string;
    online: boolean;
    createdAt: string;
  };
  stats: {
    level: number;
    xp: number;
    points: number;
    tasksCompleted: number;
    trophiesUnlocked: number;
    rank: number;
    xpToNext: number;
  };
}

function mapOverviewToProfile(overview: ApiProfileOverview): UserProfile {
  return {
    id: overview.user._id,
    displayName: overview.user.displayName,
    username: overview.user.username,
    email: overview.user.email,
    bio: overview.user.bio || "",
    avatar: overview.user.avatar || "",
    favoriteTeam: overview.user.favoriteTeam || "",
    country: overview.user.country || "",
    city: overview.user.city || "",
    joinedAt: overview.user.createdAt,
    online: !!overview.user.online,
    level: overview.stats.level,
    xp: overview.stats.xp,
    xpToNext: overview.stats.xpToNext,
    tasksCompleted: overview.stats.tasksCompleted,
    trophiesUnlocked: overview.stats.trophiesUnlocked,
    streak: 0,
    rank: overview.stats.rank,
    badges: [],
    socialLinks: [],
  };
}

export default function UserProfileModal({ userId, serverId, onClose }: UserProfileModalProps) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!token || !userId) return;

    setLoading(true);
    setError(null);

    const query = serverId ? `?serverId=${encodeURIComponent(serverId)}` : "";
    api<ApiProfileOverview>(`/users/${userId}/profile${query}`, { token })
      .then((overview) => {
        setProfile(mapOverviewToProfile(overview));
      })
      .catch((err) => {
        setError(err.message || "No se pudo cargar el perfil");
      })
      .finally(() => setLoading(false));
  }, [token, userId, serverId]);

  if (!userId) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-5xl bg-base-100 rounded-2xl border border-base-300 shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-base-300 bg-base-100 rounded-t-2xl">
          <h3 className="font-bold">Perfil de usuario</h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle" aria-label="Cerrar">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5">
          {loading && (
            <div className="flex justify-center py-10">
              <span className="loading loading-dots loading-md text-primary" />
            </div>
          )}

          {!loading && error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && profile && <UserProfileView profile={profile} />}
        </div>
      </div>
    </div>
  );
}
