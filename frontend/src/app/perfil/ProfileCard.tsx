import UserAvatar from "../components/UserAvatar";
import type { UserProfile } from "./types";
import { countryFlags } from "./types";

interface ProfileCardProps {
  profile: UserProfile;
  onViewProfile: () => void;
  onClose: () => void;
}

export default function ProfileCard({ profile, onViewProfile, onClose }: ProfileCardProps) {
  const xpProgress = Math.round((profile.xp / profile.xpToNext) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-80 bg-base-100 rounded-2xl shadow-2xl border border-base-300 overflow-hidden animate-[fadeInUp_0.2s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner */}
        <div className="h-24 bg-gradient-to-br from-primary/40 via-warning/20 to-secondary/30 relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9zdmc+')] opacity-60" />
        </div>

        {/* Avatar */}
        <div className="px-4 -mt-10 relative">
          <div className="relative w-fit">
            <div className="ring-4 ring-base-100 rounded-full">
              <UserAvatar name={profile.displayName} size="lg" online={profile.online} />
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-warning text-warning-content flex items-center justify-center text-xs font-extrabold ring-2 ring-base-100">
              {profile.level}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="px-4 pt-2 pb-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-extrabold text-lg leading-tight">{profile.displayName}</h3>
              <p className="text-xs text-base-content/40">@{profile.username}</p>
            </div>
            {profile.online && (
              <span className="badge badge-success badge-xs gap-1 mt-1">
                <span className="w-1 h-1 rounded-full bg-success-content" />
                En línea
              </span>
            )}
          </div>

          {profile.bio && (
            <p className="text-xs text-base-content/60 mt-2 line-clamp-2 leading-relaxed">
              {profile.bio}
            </p>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {profile.favoriteTeam && (
              <span className="badge badge-ghost badge-sm gap-1">
                {countryFlags[profile.favoriteTeam] || "⚽"} {profile.favoriteTeam}
              </span>
            )}
            {profile.city && (
              <span className="badge badge-ghost badge-sm gap-1">📍 {profile.city}</span>
            )}
          </div>
        </div>

        {/* XP bar */}
        <div className="px-4 pb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold text-base-content/50">
              Nivel {profile.level}
            </span>
            <span className="text-[10px] font-semibold text-warning">
              {profile.xp.toLocaleString()} / {profile.xpToNext.toLocaleString()} XP
            </span>
          </div>
          <progress className="progress progress-warning w-full h-2" value={xpProgress} max={100} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 border-t border-base-300">
          {[
            { label: "Misiones", value: profile.tasksCompleted, color: "text-primary" },
            { label: "Trofeos", value: profile.trophiesUnlocked, color: "text-success" },
            { label: "Racha", value: `🔥${profile.streak}`, color: "text-warning" },
            { label: "Rank", value: `#${profile.rank}`, color: "text-info" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center py-3">
              <p className={`text-sm font-extrabold ${stat.color}`}>{stat.value}</p>
              <p className="text-[9px] text-base-content/40">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Badges preview */}
        {profile.badges.length > 0 && (
          <div className="px-4 py-3 border-t border-base-300">
            <div className="flex items-center gap-2">
              {profile.badges.slice(0, 5).map((badge) => (
                <div
                  key={badge.id}
                  className="tooltip tooltip-top"
                  data-tip={badge.name}
                >
                  <span className="text-xl hover:scale-110 transition-transform cursor-default">
                    {badge.emoji}
                  </span>
                </div>
              ))}
              {profile.badges.length > 5 && (
                <span className="text-xs text-base-content/40">
                  +{profile.badges.length - 5}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="px-4 pb-4 pt-1 flex gap-2">
          <button
            onClick={onViewProfile}
            className="btn btn-primary btn-sm flex-1 gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
            Ver perfil
          </button>
          <button className="btn btn-ghost btn-sm flex-1 gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
            </svg>
            Mensaje
          </button>
        </div>
      </div>
    </div>
  );
}
