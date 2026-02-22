import type { Task } from "./types";
import UserAvatar from "../components/UserAvatar";

interface TaskDetailProps {
  task: Task;
  onBack: () => void;
  onStart?: () => void;
}

const typeConfig = {
  visit: { emoji: "📍", label: "Visitar lugar" },
  photo: { emoji: "📸", label: "Tomar foto" },
  quiz: { emoji: "🧠", label: "Cuestionario" },
  social: { emoji: "🤝", label: "Social" },
  challenge: { emoji: "🏆", label: "Desafío" },
};

export default function TaskDetail({ task, onBack, onStart }: TaskDetailProps) {
  const type = typeConfig[task.type];

  return (
    <div className="h-full overflow-y-auto">
      {/* Hero header */}
      <div className="relative bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/10 px-6 pt-6 pb-10">
        <button
          onClick={onBack}
          className="btn btn-ghost btn-sm gap-1 mb-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Volver a misiones
        </button>

        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-base-100 shadow-lg flex items-center justify-center text-3xl shrink-0">
            {type.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <span className="badge badge-primary badge-sm mb-2">{type.label}</span>
            <h1 className="text-2xl font-extrabold text-base-content leading-tight">
              {task.title}
            </h1>
            <p className="text-sm text-base-content/60 mt-2 leading-relaxed">
              {task.description}
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6 max-w-3xl">
        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-base-200 rounded-xl p-3 text-center">
            <p className="text-2xl font-extrabold text-warning">⚡ {task.xp}</p>
            <p className="text-[11px] text-base-content/40 mt-0.5">XP Recompensa</p>
          </div>
          <div className="bg-base-200 rounded-xl p-3 text-center">
            <p className="text-2xl font-extrabold text-primary capitalize">{task.difficulty}</p>
            <p className="text-[11px] text-base-content/40 mt-0.5">Dificultad</p>
          </div>
          <div className="bg-base-200 rounded-xl p-3 text-center">
            <p className="text-2xl font-extrabold text-info">{task.badge || "🎖️"}</p>
            <p className="text-[11px] text-base-content/40 mt-0.5">Recompensa</p>
          </div>
          <div className="bg-base-200 rounded-xl p-3 text-center">
            <p className="text-2xl font-extrabold text-base-content">{task.deadline || "∞"}</p>
            <p className="text-[11px] text-base-content/40 mt-0.5">Fecha límite</p>
          </div>
        </div>

        {/* Ubicación */}
        {task.location && (
          <div className="bg-base-200 rounded-xl p-4">
            <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
              Ubicación
            </h3>
            <p className="text-sm text-base-content/60">{task.location}</p>
            {/* Placeholder del mapa */}
            <div className="mt-3 h-40 bg-base-300 rounded-lg flex items-center justify-center text-base-content/20">
              <span className="text-sm">🗺️ Mapa del lugar</span>
            </div>
          </div>
        )}

        {/* Instrucciones por tipo */}
        {task.type === "photo" && (
          <div className="bg-base-200 rounded-xl p-4">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              📷 Instrucciones de la foto
            </h3>
            <ul className="space-y-2 text-sm text-base-content/60">
              <li className="flex items-start gap-2">
                <span className="badge badge-primary badge-xs mt-1">1</span>
                Dirígete a la ubicación indicada
              </li>
              <li className="flex items-start gap-2">
                <span className="badge badge-primary badge-xs mt-1">2</span>
                Toma una foto clara del lugar o monumento
              </li>
              <li className="flex items-start gap-2">
                <span className="badge badge-primary badge-xs mt-1">3</span>
                Sube tu foto desde el botón de abajo
              </li>
            </ul>

            {/* Upload area */}
            <div className="mt-4 border-2 border-dashed border-base-300 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 mx-auto text-base-content/20 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
              <p className="text-sm text-base-content/40">
                Arrastra tu foto aquí o <span className="text-primary font-semibold">selecciona un archivo</span>
              </p>
            </div>
          </div>
        )}

        {task.type === "quiz" && (
          <div className="bg-base-200 rounded-xl p-4">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              🧠 Sobre el cuestionario
            </h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-base-100 rounded-lg p-3">
                <p className="text-lg font-bold text-primary">10</p>
                <p className="text-[10px] text-base-content/40">Preguntas</p>
              </div>
              <div className="bg-base-100 rounded-lg p-3">
                <p className="text-lg font-bold text-warning">15 min</p>
                <p className="text-[10px] text-base-content/40">Tiempo</p>
              </div>
              <div className="bg-base-100 rounded-lg p-3">
                <p className="text-lg font-bold text-success">70%</p>
                <p className="text-[10px] text-base-content/40">Para aprobar</p>
              </div>
            </div>
          </div>
        )}

        {/* Quiénes la han completado */}
        <div className="bg-base-200 rounded-xl p-4">
          <h3 className="font-bold text-sm mb-3">
            Completada por 23 usuarios
          </h3>
          <div className="flex -space-x-2">
            {["Carlos Vela", "Ana Torres", "Lucía Méndez", "Pedro Ramírez", "Roberto Díaz"].map(
              (name) => (
                <UserAvatar key={name} name={name} size="sm" />
              )
            )}
            <div className="w-8 h-8 rounded-full bg-base-300 flex items-center justify-center text-xs font-bold text-base-content/60 ring-2 ring-base-200">
              +18
            </div>
          </div>
        </div>

        {/* Botón de acción */}
        <div className="sticky bottom-0 pb-4 pt-2 bg-gradient-to-t from-base-100 via-base-100 to-transparent">
          {task.status === "available" && (
            <button
              onClick={onStart}
              className="btn btn-primary w-full text-base font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              🚀 Comenzar misión
            </button>
          )}
          {task.status === "in-progress" && (
            <div className="space-y-3">
              <progress
                className="progress progress-primary w-full h-3"
                value={task.progress || 0}
                max={100}
              />
              <button className="btn btn-primary w-full text-base font-bold">
                {task.type === "quiz" ? "📝 Continuar cuestionario" : "📤 Enviar evidencia"}
              </button>
            </div>
          )}
          {task.status === "completed" && (
            <div className="text-center py-4">
              <p className="text-4xl mb-2">🎉</p>
              <p className="font-bold text-success text-lg">¡Misión completada!</p>
              <p className="text-sm text-base-content/50">Ganaste {task.xp} XP y {task.badge}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
