import UserAvatar from "../components/UserAvatar";
import type { UserProfile } from "./types";
import { countryFlags } from "./types";

interface UserProfileViewProps {
  profile: UserProfile;
  onEdit: () => void;
}

export default function UserProfileView({ profile, onEdit }: UserProfileViewProps) {
  const xpProgress = Math.round((profile.xp / profile.xpToNext) * 100);
  const memberSince = new Date(profile.joinedAt).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
  });

  return (
    <div className="space-y-6">
      {/* Banner + Avatar hero */}
      <div className="relative">
        {/* Banner */}
        <div className="h-40 rounded-2xl bg-gradient-to-br from-primary/30 via-warning/20 to-secondary/30 overflow-hidden">
          <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9zdmc+')] opacity-60" />
        </div>

        {/* Avatar */}
        <div className="absolute -bottom-10 left-6">
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-br from-warning to-primary rounded-full opacity-40 blur-md" />
            <div className="relative ring-4 ring-base-100 rounded-full">
              <UserAvatar name={profile.displayName} size="xl" online={profile.online} />
            </div>
            {/* Level badge */}
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-warning text-warning-content flex items-center justify-center text-sm font-extrabold ring-2 ring-base-100 shadow-lg">
              {profile.level}
            </div>
          </div>
        </div>

        {/* Edit button */}
        <button
          onClick={onEdit}
          className="absolute top-3 right-3 btn btn-sm btn-ghost bg-base-100/80 backdrop-blur gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
          </svg>
          Editar perfil
        </button>
      </div>

      {/* Profile info */}
      <div className="pt-8 px-1">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-extrabold">{profile.displayName}</h1>
            <p className="text-sm text-base-content/50">@{profile.username}</p>
          </div>
          <div className="flex items-center gap-2">
            {profile.online && (
              <span className="badge badge-success badge-sm gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-success-content" />
                En línea
              </span>
            )}
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="mt-3 text-sm text-base-content/70 leading-relaxed">{profile.bio}</p>
        )}

        {/* Info tags */}
        <div className="flex flex-wrap gap-2 mt-4">
          {profile.favoriteTeam && (
            <div className="badge badge-ghost gap-1">
              {countryFlags[profile.favoriteTeam] || "⚽"} {profile.favoriteTeam}
            </div>
          )}
          {profile.city && (
            <div className="badge badge-ghost gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
              {profile.city}
            </div>
          )}
          <div className="badge badge-ghost gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
            Desde {memberSince}
          </div>
        </div>

        {/* Social links */}
        {profile.socialLinks.length > 0 && (
          <div className="flex gap-2 mt-3">
            {profile.socialLinks.map((link) => {
              const icons: Record<string, string> = {
                twitter: "𝕏",
                instagram: "📷",
                tiktok: "🎵",
                youtube: "▶️",
                website: "🌐",
              };
              return (
                <a
                  key={link.platform}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost btn-xs btn-square text-base-content/50 hover:text-primary"
                >
                  {icons[link.platform]}
                </a>
              );
            })}
          </div>
        )}
      </div>

      {/* XP Progress */}
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚡</span>
              <span className="font-bold text-sm">Nivel {profile.level}</span>
            </div>
            <span className="text-sm font-semibold text-warning">
              {profile.xp.toLocaleString()} / {profile.xpToNext.toLocaleString()} XP
            </span>
          </div>
          <progress className="progress progress-warning w-full h-3" value={xpProgress} max={100} />
          <p className="text-xs text-base-content/40 mt-1">
            {(profile.xpToNext - profile.xp).toLocaleString()} XP para el siguiente nivel
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Misiones", value: profile.tasksCompleted, icon: "📋", color: "text-primary" },
          { label: "Trofeos", value: profile.trophiesUnlocked, icon: "🏆", color: "text-success" },
          { label: "Racha", value: `🔥 ${profile.streak}`, icon: "", color: "text-warning" },
          { label: "Ranking", value: `#${profile.rank}`, icon: "", color: "text-info" },
        ].map((stat) => (
          <div key={stat.label} className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body p-4 items-center text-center">
              <p className={`text-2xl font-extrabold ${stat.color}`}>
                {stat.icon} {stat.value}
              </p>
              <p className="text-[11px] text-base-content/40">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Badges */}
      {profile.badges.length > 0 && (
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-4">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              <span>🎖️</span>
              Insignias obtenidas
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {profile.badges.map((badge) => (
                <div
                  key={badge.id}
                  className="group flex flex-col items-center gap-2 p-3 rounded-xl bg-base-200/50 hover:bg-primary/10 transition-colors cursor-default"
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform">{badge.emoji}</span>
                  <div className="text-center">
                    <p className="text-xs font-bold">{badge.name}</p>
                    <p className="text-[10px] text-base-content/40">{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent activity */}
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body p-4">
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
            <span>📊</span>
            Actividad reciente
          </h3>
          <div className="space-y-3">
            {[
              { text: "Completó \"Quiz: Historia de los Mundiales\"", time: "Hace 2 horas", icon: "✅" },
              { text: "Subió foto para \"Captura el mural mundialista\"", time: "Ayer", icon: "📸" },
              { text: "Alcanzó el nivel 12", time: "Hace 2 días", icon: "⬆️" },
              { text: "Desbloqueó trofeo \"Fotógrafo\"", time: "Hace 4 días", icon: "🏆" },
              { text: "Inició racha de 5 días", time: "Hace 5 días", icon: "🔥" },
            ].map((activity, i) => (
              <div key={i} className="flex items-center gap-3 py-1">
                <span className="text-base shrink-0">{activity.icon}</span>
                <p className="text-sm text-base-content/70 flex-1">{activity.text}</p>
                <span className="text-xs text-base-content/30 shrink-0">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
