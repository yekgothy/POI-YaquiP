import { useEffect, useState } from "react";
import UserProfileView from "./UserProfileView";
import ProfileEditor from "./ProfileEditor";
import SettingsView from "./SettingsView";
import type { UserProfile, AppSettings } from "./types";
import { defaultProfile, defaultSettings } from "./types";
import { api, API_URL } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

type ProfileView = "profile" | "edit" | "settings";

interface ProfilePageProps {
  serverId?: string | null;
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

interface ApiProgressOverview {
  server_id: string;
  user_id: string;
  xp: number;
  points: number;
  level: number;
  tasks_completed: number;
  current_streak: number;
  max_streak: number;
  last_task_at: string | null;
}

function useUserProgress(userId?: string, serverId?: string, token?: string) {
  const [progress, setProgress] = useState<ApiProgressOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !serverId || !token) {
      setProgress(null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    api<ApiProgressOverview>(`/user/progress?userId=${encodeURIComponent(userId)}&serverId=${encodeURIComponent(serverId)}`, {
      token,
    })
      .then((data) => {
        if (!cancelled) {
          setProgress(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("No se pudo cargar el progreso");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [userId, serverId, token]);

  return { progress, loading, error };
}

export default function ProfilePage({ serverId }: ProfilePageProps) {
  const { user, token, updateCurrentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [view, setView] = useState<ProfileView>("profile");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { progress, loading: progressLoading, error: progressError } = useUserProgress(
    user?._id,
    serverId || undefined,
    token || undefined
  );

  useEffect(() => {
    if (!user) return;

    setProfile((prev) => ({
      ...prev,
      id: user._id,
      displayName: user.displayName,
      username: user.username,
      email: user.email,
      bio: user.bio || "",
      avatar: user.avatar || "",
      favoriteTeam: user.favoriteTeam || "",
      country: user.country || "",
      city: user.city || "",
      online: !!user.online,
    }));
  }, [user]);

  useEffect(() => {
    if (!progress) return;

    setProfile((prev) => ({
      ...prev,
      level: progress.level,
      xp: progress.xp,
      tasksCompleted: progress.tasks_completed,
      streak: progress.current_streak,
    }));
  }, [progress]);

  useEffect(() => {
    if (!token || !user?._id) return;

    const query = serverId ? `?serverId=${encodeURIComponent(serverId)}` : "";
    api<ApiProfileOverview>(`/users/${user._id}/profile${query}`, { token })
      .then((overview) => {
        setProfile((prev) => ({
          ...prev,
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
          rank: overview.stats.rank,
        }));
      })
      .catch(() => {
        // Non-blocking: keep local profile if stats request fails.
      });
  }, [token, user?._id, serverId]);

  const handleSaveProfile = async (updates: Partial<UserProfile>) => {
    if (!token) return;

    setError(null);
    setSaving(true);

    try {
      const payload = {
        displayName: updates.displayName,
        bio: updates.bio,
        favoriteTeam: updates.favoriteTeam,
        country: updates.country,
        city: updates.city,
        avatar: updates.avatar,
      };

      const saved = await api<{
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
      }>("/users/profile", {
        token,
        method: "PUT",
        body: payload,
      });

      setProfile((prev) => ({
        ...prev,
        displayName: saved.displayName,
        username: saved.username,
        email: saved.email,
        bio: saved.bio || "",
        favoriteTeam: saved.favoriteTeam || "",
        country: saved.country || "",
        city: saved.city || "",
        avatar: saved.avatar || "",
      }));

      updateCurrentUser({
        displayName: saved.displayName,
        username: saved.username,
        email: saved.email,
        bio: saved.bio || "",
        favoriteTeam: saved.favoriteTeam || "",
        country: saved.country || "",
        city: saved.city || "",
        avatar: saved.avatar || "",
      });

      setView("profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el perfil");
    } finally {
      setSaving(false);
    }
  };

  const handleUploadAvatar = async (file: File) => {
    if (!token) return;

    setError(null);
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_URL}/uploads/avatar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "No se pudo subir el avatar");
      }

      setProfile((prev) => ({
        ...prev,
        avatar: data.avatarUrl,
      }));

      updateCurrentUser({ avatar: data.avatarUrl });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir el avatar");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    if (newSettings.theme !== settings.theme) {
      document.documentElement.setAttribute("data-theme", newSettings.theme);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-base-200/50">
      <div className="max-w-4xl mx-auto p-6">
        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        {progressError && !error && (
          <div className="alert alert-warning mb-4">
            <span>{progressError}</span>
          </div>
        )}

        {saving && (
          <div className="alert alert-info mb-4 py-2">
            <span>Guardando cambios...</span>
          </div>
        )}

        {view === "profile" && (
          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
              <div className="text-sm opacity-70">Nivel</div>
              <div className="text-3xl font-bold text-primary">{profile.level}</div>
            </div>
            <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
              <div className="text-sm opacity-70">Racha actual</div>
              <div className="text-3xl font-bold text-secondary">{profile.streak} días</div>
              <div className="text-xs opacity-60">
                {progressLoading ? "Cargando racha..." : progress ? `Máxima: ${progress.max_streak} días` : "Sin datos de backend"}
              </div>
            </div>
            <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
              <div className="text-sm opacity-70">Tareas completadas</div>
              <div className="text-3xl font-bold text-accent">{profile.tasksCompleted}</div>
            </div>
          </div>
        )}

        {/* Tabs de navegación */}
        {view === "profile" && (
          <div className="flex items-center gap-2 mb-6">
            <button className="btn btn-sm btn-primary gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
              Mi perfil
            </button>
            <button
              onClick={() => setView("settings")}
              className="btn btn-sm btn-ghost gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
              Configuración
            </button>
          </div>
        )}

        {view === "settings" && (
          <div className="flex items-center gap-2 mb-6">
            <button
              onClick={() => setView("profile")}
              className="btn btn-sm btn-ghost gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
              Mi perfil
            </button>
            <button className="btn btn-sm btn-primary gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
              Configuración
            </button>
          </div>
        )}

        {/* Content */}
        {view === "profile" && (
          <>
            <UserProfileView profile={profile} onEdit={() => setView("edit")} />
          </>
        )}
        {view === "edit" && (
          <ProfileEditor
            profile={profile}
            onSave={handleSaveProfile}
            onUploadAvatar={handleUploadAvatar}
            onCancel={() => setView("profile")}
          />
        )}
        {view === "settings" && (
          <SettingsView settings={settings} onSave={handleSaveSettings} />
        )}
      </div>
    </div>
  );
}
