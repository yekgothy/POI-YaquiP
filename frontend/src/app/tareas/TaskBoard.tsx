import { useState } from "react";
import TaskCard from "./TaskCard";
import TaskDetail from "./TaskDetail";
import QuizView from "./QuizView";
import type { Task } from "./types";

const mockTasks: Task[] = [
  {
    id: "1",
    title: "Visita el Estadio Azteca",
    description: "Dirígete al Estadio Azteca en la Ciudad de México y toma una foto frente a la entrada principal. Este icónico estadio ha sido sede de dos finales mundialistas.",
    type: "visit",
    difficulty: "easy",
    xp: 150,
    status: "available",
    location: "Estadio Azteca, CDMX",
    badge: "🏟️",
    category: "Sedes",
    deadline: "Mar 15",
  },
  {
    id: "2",
    title: "Quiz: Historia de los Mundiales",
    description: "Demuestra cuánto sabes sobre la historia de las Copas del Mundo. 10 preguntas, 15 minutos. ¡Necesitas 70% para aprobar!",
    type: "quiz",
    difficulty: "medium",
    xp: 300,
    status: "available",
    badge: "🧠",
    category: "Conocimiento",
  },
  {
    id: "3",
    title: "Captura el mural mundialista",
    description: "Encuentra y fotografía uno de los murales oficiales del Mundial 2026 en tu ciudad. Comparte la foto con la comunidad.",
    type: "photo",
    difficulty: "easy",
    xp: 200,
    status: "in-progress",
    progress: 40,
    location: "Cualquier mural oficial",
    badge: "📸",
    category: "Arte",
    deadline: "Mar 20",
  },
  {
    id: "4",
    title: "¡Reúne a tu equipo!",
    description: "Invita a 5 amigos a unirse a la plataforma y forma un equipo. Juntos podrán competir en la tabla de posiciones grupal.",
    type: "social",
    difficulty: "medium",
    xp: 500,
    status: "in-progress",
    progress: 60,
    badge: "🤝",
    category: "Social",
  },
  {
    id: "5",
    title: "Máster de predicciones",
    description: "Acierta los resultados de 10 partidos consecutivos en la sección de predicciones. ¡Solo los mejores analistas lo logran!",
    type: "challenge",
    difficulty: "hard",
    xp: 1000,
    status: "available",
    badge: "🔮",
    category: "Desafíos",
  },
  {
    id: "6",
    title: "Ruta de los campeones",
    description: "Visita los 3 estadios principales de tu región y completa el recorrido mundialista. Documenta cada visita con fotos.",
    type: "visit",
    difficulty: "hard",
    xp: 800,
    status: "available",
    location: "Múltiples sedes",
    badge: "🗺️",
    category: "Sedes",
    deadline: "Abr 1",
  },
  {
    id: "7",
    title: "Quiz: Selecciones legendarias",
    description: "¿Conoces a todas las selecciones que han participado en más de 10 Mundiales? Pon a prueba tu memoria futbolística.",
    type: "quiz",
    difficulty: "hard",
    xp: 500,
    status: "available",
    badge: "⭐",
    category: "Conocimiento",
  },
  {
    id: "8",
    title: "Desafío del coleccionista",
    description: "Completa 15 tareas de diferentes categorías para desbloquear el trofeo de Coleccionista Legendario.",
    type: "challenge",
    difficulty: "legendary",
    xp: 2000,
    status: "locked",
    badge: "👑",
    category: "Desafíos",
  },
];

const categories = ["Todas", "Sedes", "Conocimiento", "Arte", "Social", "Desafíos"];
const statusFilters = ["Todas", "Disponible", "En progreso", "Completada"];

type SubView = "board" | "detail" | "quiz";

export default function TaskBoard() {
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [selectedStatus, setSelectedStatus] = useState("Todas");
  const [subView, setSubView] = useState<SubView>("board");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const statusMap: Record<string, string> = {
    Disponible: "available",
    "En progreso": "in-progress",
    Completada: "completed",
  };

  const filtered = mockTasks.filter((t) => {
    if (selectedCategory !== "Todas" && t.category !== selectedCategory) return false;
    if (selectedStatus !== "Todas" && t.status !== statusMap[selectedStatus]) return false;
    return true;
  });

  const handleTaskClick = (task: Task) => {
    if (task.status === "locked") return;
    setSelectedTask(task);
    setSubView("detail");
  };

  if (subView === "quiz" && selectedTask) {
    return (
      <QuizView
        title={selectedTask.title}
        questions={[]}
        onFinish={() => {}}
        onBack={() => setSubView("board")}
      />
    );
  }

  if (subView === "detail" && selectedTask) {
    return (
      <TaskDetail
        task={selectedTask}
        onBack={() => {
          setSubView("board");
          setSelectedTask(null);
        }}
        onStart={() => {
          if (selectedTask.type === "quiz") {
            setSubView("quiz");
          }
        }}
      />
    );
  }

  // Contar stats
  const inProgress = mockTasks.filter((t) => t.status === "in-progress").length;
  const completed = mockTasks.filter((t) => t.status === "completed").length;
  const totalXp = mockTasks.filter((t) => t.status === "completed").reduce((s, t) => s + t.xp, 0);

  return (
    <div className="h-full overflow-y-auto">
      {/* Header heroico */}
      <div className="bg-gradient-to-r from-primary/10 via-secondary/5 to-accent/10 px-6 py-6 border-b border-base-300">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-base-content flex items-center gap-2">
              ⚽ Misiones del Mundial
            </h1>
            <p className="text-sm text-base-content/50 mt-1">
              Completa retos, gana XP y desbloquea recompensas épicas
            </p>
          </div>
        </div>

        {/* Stats rápidos */}
        <div className="flex gap-4 flex-wrap">
          <div className="flex items-center gap-2 bg-base-100/80 backdrop-blur rounded-lg px-3 py-2 shadow-sm">
            <span className="text-warning text-lg">🔥</span>
            <div>
              <p className="text-xs text-base-content/40">En progreso</p>
              <p className="font-bold text-sm">{inProgress} misiones</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-base-100/80 backdrop-blur rounded-lg px-3 py-2 shadow-sm">
            <span className="text-success text-lg">✅</span>
            <div>
              <p className="text-xs text-base-content/40">Completadas</p>
              <p className="font-bold text-sm">{completed} misiones</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-base-100/80 backdrop-blur rounded-lg px-3 py-2 shadow-sm">
            <span className="text-warning text-lg">⚡</span>
            <div>
              <p className="text-xs text-base-content/40">XP ganada</p>
              <p className="font-bold text-sm">{totalXp} XP</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Filtros */}
        <div className="flex flex-wrap gap-4 mb-6">
          {/* Categoría */}
          <div className="flex gap-1 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`btn btn-xs ${
                  selectedCategory === cat ? "btn-primary" : "btn-ghost"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="w-px h-6 bg-base-300 self-center hidden sm:block" />

          {/* Estado */}
          <div className="flex gap-1 flex-wrap">
            {statusFilters.map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`btn btn-xs ${
                  selectedStatus === st ? "btn-secondary" : "btn-ghost"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de tareas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => handleTaskClick(task)}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-base-content/40">No hay misiones con esos filtros</p>
          </div>
        )}
      </div>
    </div>
  );
}
