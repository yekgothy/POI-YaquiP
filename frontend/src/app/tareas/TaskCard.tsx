import type { Task } from "./types";

const typeConfig = {
  visit: { emoji: "📍", label: "Visitar lugar", color: "badge-info" },
  photo: { emoji: "📸", label: "Tomar foto", color: "badge-success" },
  quiz: { emoji: "🧠", label: "Cuestionario", color: "badge-warning" },
  social: { emoji: "🤝", label: "Social", color: "badge-secondary" },
  challenge: { emoji: "🏆", label: "Desafío", color: "badge-error" },
};

const difficultyConfig = {
  easy: { label: "Fácil", stars: 1, color: "text-success" },
  medium: { label: "Medio", stars: 2, color: "text-warning" },
  hard: { label: "Difícil", stars: 3, color: "text-error" },
  legendary: { label: "Legendario", stars: 4, color: "text-accent" },
};

const statusConfig = {
  available: { label: "Disponible", class: "" },
  "in-progress": { label: "En progreso", class: "border-l-4 border-l-primary" },
  completed: { label: "Completada", class: "opacity-75" },
  locked: { label: "Bloqueada", class: "opacity-50 grayscale" },
};

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

export default function TaskCard({ task, onClick }: TaskCardProps) {
  const type = typeConfig[task.type];
  const diff = difficultyConfig[task.difficulty];
  const status = statusConfig[task.status];

  return (
    <button
      onClick={onClick}
      disabled={task.status === "locked"}
      className={`card bg-base-100 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 w-full text-left group ${status.class} ${
        task.status === "locked" ? "cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      <div className="card-body p-4 gap-3">
        {/* Header: tipo + dificultad */}
        <div className="flex items-center justify-between">
          <span className={`badge ${type.color} badge-sm gap-1 font-medium`}>
            {type.emoji} {type.label}
          </span>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <svg
                key={i}
                xmlns="http://www.w3.org/2000/svg"
                className={`w-3.5 h-3.5 ${
                  i < diff.stars ? diff.color : "text-base-300"
                }`}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
        </div>

        {/* Título */}
        <h3 className="font-bold text-base-content group-hover:text-primary transition-colors leading-tight">
          {task.status === "locked" && (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 inline mr-1 text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          )}
          {task.title}
        </h3>

        {/* Descripción */}
        <p className="text-xs text-base-content/50 line-clamp-2 leading-relaxed">
          {task.description}
        </p>

        {/* Ubicación si aplica */}
        {task.location && (
          <div className="flex items-center gap-1 text-xs text-base-content/40">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
            {task.location}
          </div>
        )}

        {/* Barra de progreso */}
        {task.status === "in-progress" && task.progress !== undefined && (
          <div className="w-full">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] text-base-content/40">Progreso</span>
              <span className="text-[10px] font-bold text-primary">
                {task.progress}%
              </span>
            </div>
            <progress
              className="progress progress-primary w-full h-1.5"
              value={task.progress}
              max={100}
            />
          </div>
        )}

        {/* Completada */}
        {task.status === "completed" && (
          <div className="flex items-center gap-1.5 text-success text-xs font-semibold">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            ¡Completada!
          </div>
        )}

        {/* Footer: XP + deadline */}
        <div className="flex items-center justify-between pt-1 border-t border-base-300/50">
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-warning">⚡ {task.xp} XP</span>
            {task.badge && <span className="text-sm">{task.badge}</span>}
          </div>
          {task.deadline && (
            <span className="text-[10px] text-base-content/30 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              {task.deadline}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
