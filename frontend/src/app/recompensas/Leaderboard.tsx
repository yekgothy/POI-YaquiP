import UserAvatar from "../components/UserAvatar";

interface LeaderEntry {
  rank: number;
  name: string;
  xp: number;
  level: number;
  tasksCompleted: number;
  isYou?: boolean;
}

interface LeaderboardProps {
  entries?: LeaderEntry[];
}

const defaultLeaderboard: LeaderEntry[] = [
  { rank: 1, name: "Carlos Vela", xp: 8500, level: 22, tasksCompleted: 34 },
  { rank: 2, name: "Ana Torres", xp: 7200, level: 19, tasksCompleted: 28 },
  { rank: 3, name: "Lucia Mendez", xp: 6800, level: 18, tasksCompleted: 25 },
  { rank: 4, name: "Pedro Ramirez", xp: 5400, level: 15, tasksCompleted: 21 },
  { rank: 5, name: "Tu", xp: 4200, level: 12, tasksCompleted: 16, isYou: true },
  { rank: 6, name: "Roberto Diaz", xp: 3800, level: 11, tasksCompleted: 14 },
];


export default function Leaderboard({ entries }: LeaderboardProps) {
  const leaderboard = entries && entries.length ? entries : defaultLeaderboard;

  if (leaderboard.length < 3) {
    return (
      <div className="bg-base-100 rounded-xl border border-base-300 p-6 text-sm text-base-content/60">
        Aun no hay suficientes participantes para mostrar el podio.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="flex flex-col items-center pt-6">
          <UserAvatar name={leaderboard[1].name} size="lg" />
          <span className="text-xs uppercase tracking-wide text-base-content/50 mt-2">Puesto 2</span>
          <p className="font-bold text-sm mt-1 truncate max-w-full">{leaderboard[1].name}</p>
          <p className="text-xs text-warning font-semibold">{leaderboard[1].xp.toLocaleString()} XP</p>
          <div className="w-full bg-base-300 rounded-t-lg mt-2 h-20 flex items-end justify-center pb-2">
            <span className="text-3xl font-extrabold text-base-content/20">2</span>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="absolute -inset-1 bg-warning/20 rounded-full animate-pulse" />
            <UserAvatar name={leaderboard[0].name} size="lg" />
          </div>
          <span className="text-xs uppercase tracking-wide text-warning mt-2">Puesto 1</span>
          <p className="font-bold text-sm mt-1 truncate max-w-full">{leaderboard[0].name}</p>
          <p className="text-xs text-warning font-semibold">{leaderboard[0].xp.toLocaleString()} XP</p>
          <div className="w-full bg-warning/20 rounded-t-lg mt-2 h-28 flex items-end justify-center pb-2">
            <span className="text-3xl font-extrabold text-warning/40">1</span>
          </div>
        </div>

        <div className="flex flex-col items-center pt-10">
          <UserAvatar name={leaderboard[2].name} size="lg" />
          <span className="text-xs uppercase tracking-wide text-base-content/50 mt-2">Puesto 3</span>
          <p className="font-bold text-sm mt-1 truncate max-w-full">{leaderboard[2].name}</p>
          <p className="text-xs text-warning font-semibold">{leaderboard[2].xp.toLocaleString()} XP</p>
          <div className="w-full bg-base-300 rounded-t-lg mt-2 h-14 flex items-end justify-center pb-2">
            <span className="text-3xl font-extrabold text-base-content/20">3</span>
          </div>
        </div>
      </div>

      <div className="bg-base-100 rounded-xl overflow-hidden border border-base-300">
        {leaderboard.slice(3).map((entry) => (
          <div
            key={entry.rank}
            className={`flex items-center gap-3 px-4 py-3 border-b border-base-300/50 last:border-b-0 transition-colors ${
              entry.isYou ? "bg-primary/10" : "hover:bg-base-200/50"
            }`}
          >
            <span
              className={`w-8 text-center font-bold text-sm ${
                entry.isYou ? "text-primary" : "text-base-content/40"
              }`}
            >
              #{entry.rank}
            </span>

            <UserAvatar name={entry.name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold truncate ${entry.isYou ? "text-primary" : ""}`}>
                {entry.name} {entry.isYou && <span className="badge badge-primary badge-xs ml-1">Tu</span>}
              </p>
              <p className="text-[10px] text-base-content/30">
                Nivel {entry.level} • {entry.tasksCompleted} misiones
              </p>
            </div>

            <span className="text-sm font-bold text-warning">{entry.xp.toLocaleString()} XP</span>
          </div>
        ))}
      </div>
    </div>
  );
}
