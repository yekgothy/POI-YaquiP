import { useState } from "react";
import AdminStats from "./AdminStats";
import TaskManager from "./TaskManager";
import TaskForm from "./TaskForm";
import type { AdminTask, TaskFormData } from "./types";

type AdminView = "dashboard" | "create" | "edit";

// Datos mock de tareas existentes
const initialTasks: AdminTask[] = [
  {
    id: "1",
    title: "Visita el Estadio Azteca",
    description: "Dirígete al Estadio Azteca en la Ciudad de México y toma una foto frente a la entrada principal.",
    type: "visit",
    difficulty: "easy",
    xp: 150,
    status: "available",
    location: "Estadio Azteca, CDMX",
    badge: "🏟️",
    category: "Sedes",
    deadline: "Mar 15",
    createdAt: "2026-01-15",
    createdBy: "Admin",
    active: true,
    completedBy: 48,
    totalParticipants: 120,
  },
  {
    id: "2",
    title: "Quiz: Historia de los Mundiales",
    description: "Demuestra cuánto sabes sobre la historia de las Copas del Mundo. 10 preguntas, 15 minutos.",
    type: "quiz",
    difficulty: "medium",
    xp: 300,
    status: "available",
    badge: "🧠",
    category: "Conocimiento",
    createdAt: "2026-01-20",
    createdBy: "Admin",
    active: true,
    completedBy: 234,
    totalParticipants: 412,
  },
  {
    id: "3",
    title: "Captura el mural mundialista",
    description: "Encuentra y fotografía uno de los murales oficiales del Mundial 2026 en tu ciudad.",
    type: "photo",
    difficulty: "easy",
    xp: 200,
    status: "available",
    location: "Cualquier mural oficial",
    badge: "📸",
    category: "Arte",
    deadline: "Mar 20",
    createdAt: "2026-01-22",
    createdBy: "Admin",
    active: true,
    completedBy: 87,
    totalParticipants: 195,
  },
  {
    id: "4",
    title: "¡Reúne a tu equipo!",
    description: "Invita a 5 amigos a unirse a la plataforma y forma un equipo.",
    type: "social",
    difficulty: "medium",
    xp: 500,
    status: "available",
    badge: "👥",
    category: "Social",
    createdAt: "2026-01-25",
    createdBy: "Admin",
    active: true,
    completedBy: 31,
    totalParticipants: 156,
  },
  {
    id: "5",
    title: "Maratón de sedes",
    description: "Visita al menos 3 estadios sede del Mundial 2026 en México.",
    type: "challenge",
    difficulty: "legendary",
    xp: 2000,
    status: "available",
    badge: "🏆",
    category: "Desafíos",
    deadline: "Jun 01",
    createdAt: "2026-02-01",
    createdBy: "Admin",
    active: true,
    completedBy: 5,
    totalParticipants: 89,
  },
  {
    id: "6",
    title: "Receta mundialista",
    description: "Prepara un platillo típico de alguno de los países participantes y sube una foto.",
    type: "photo",
    difficulty: "easy",
    xp: 150,
    status: "available",
    badge: "🍽️",
    category: "Gastronomía",
    createdAt: "2026-02-05",
    createdBy: "Admin",
    active: false,
    completedBy: 0,
    totalParticipants: 0,
  },
  {
    id: "7",
    title: "Tour por el Estadio BBVA",
    description: "Realiza el tour oficial del Estadio BBVA en Monterrey y comparte tu experiencia.",
    type: "visit",
    difficulty: "medium",
    xp: 250,
    status: "available",
    location: "Estadio BBVA, Monterrey",
    badge: "🏟️",
    category: "Sedes",
    deadline: "Abr 10",
    createdAt: "2026-02-10",
    createdBy: "Admin",
    active: true,
    completedBy: 22,
    totalParticipants: 67,
  },
  {
    id: "8",
    title: "Quiz: Reglas del fútbol",
    description: "¿Conoces todas las reglas del fútbol? Pon a prueba tu conocimiento con este quiz.",
    type: "quiz",
    difficulty: "hard",
    xp: 400,
    status: "available",
    badge: "📋",
    category: "Conocimiento",
    createdAt: "2026-02-12",
    createdBy: "Admin",
    active: true,
    completedBy: 67,
    totalParticipants: 198,
  },
];

export default function AdminPanel() {
  const [tasks, setTasks] = useState<AdminTask[]>(initialTasks);
  const [view, setView] = useState<AdminView>("dashboard");
  const [editingTask, setEditingTask] = useState<AdminTask | null>(null);

  const activeTasks = tasks.filter((t) => t.active).length;
  const totalCompletions = tasks.reduce((sum, t) => sum + t.completedBy, 0);
  const totalParticipants = tasks.reduce((sum, t) => sum + t.totalParticipants, 0);

  const handleCreate = (data: TaskFormData) => {
    const newTask: AdminTask = {
      id: String(Date.now()),
      title: data.title,
      description: data.description,
      type: data.type,
      difficulty: data.difficulty,
      xp: data.xp,
      status: data.active ? "available" : "locked",
      location: data.location || undefined,
      deadline: data.deadline || undefined,
      badge: data.badge,
      image: data.image || undefined,
      category: data.category,
      createdAt: new Date().toISOString().split("T")[0],
      createdBy: "Admin",
      active: data.active,
      completedBy: 0,
      totalParticipants: 0,
    };
    setTasks((prev) => [newTask, ...prev]);
    setView("dashboard");
  };

  const handleEdit = (data: TaskFormData) => {
    if (!editingTask) return;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === editingTask.id
          ? {
              ...t,
              title: data.title,
              description: data.description,
              type: data.type,
              difficulty: data.difficulty,
              xp: data.xp,
              location: data.location || undefined,
              deadline: data.deadline || undefined,
              badge: data.badge,
              image: data.image || undefined,
              category: data.category,
              active: data.active,
              status: data.active ? "available" : "locked",
            }
          : t
      )
    );
    setEditingTask(null);
    setView("dashboard");
  };

  const handleToggleActive = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, active: !t.active, status: t.active ? "locked" : "available" } : t
      )
    );
  };

  const handleDelete = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const startEdit = (task: AdminTask) => {
    setEditingTask(task);
    setView("edit");
  };

  return (
    <div className="h-full overflow-y-auto bg-base-200/50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header del admin */}
        {view === "dashboard" && (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Panel de Administración</h1>
                  <p className="text-sm text-base-content/50">
                    Gestiona las tareas y misiones del Mundial 2026
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="badge badge-primary badge-lg gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                  </svg>
                  Moderador
                </div>
              </div>
            </div>

            {/* Estadísticas */}
            <AdminStats
              totalTasks={tasks.length}
              activeTasks={activeTasks}
              totalCompletions={totalCompletions}
              totalParticipants={totalParticipants}
            />

            {/* Tabla de tareas */}
            <div className="card bg-base-100 border border-base-300 shadow-sm">
              <div className="card-body">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="card-title text-lg">Gestión de Tareas</h2>
                  <div className="badge badge-ghost badge-sm">{tasks.length}</div>
                </div>
                <TaskManager
                  tasks={tasks}
                  onEdit={startEdit}
                  onToggleActive={handleToggleActive}
                  onDelete={handleDelete}
                  onCreate={() => setView("create")}
                />
              </div>
            </div>

            {/* Actividad reciente */}
            <div className="card bg-base-100 border border-base-300 shadow-sm">
              <div className="card-body">
                <h2 className="card-title text-lg mb-3">Actividad reciente</h2>
                <div className="space-y-3">
                  {[
                    {
                      action: "completó",
                      user: "Carlos Vela",
                      task: "Quiz: Historia de los Mundiales",
                      time: "Hace 5 min",
                      icon: "✅",
                    },
                    {
                      action: "inició",
                      user: "Ana Torres",
                      task: "Visita el Estadio Azteca",
                      time: "Hace 12 min",
                      icon: "▶️",
                    },
                    {
                      action: "subió foto para",
                      user: "Miguel Herrera",
                      task: "Captura el mural mundialista",
                      time: "Hace 28 min",
                      icon: "📸",
                    },
                    {
                      action: "completó",
                      user: "Lucía Méndez",
                      task: "¡Reúne a tu equipo!",
                      time: "Hace 1 hora",
                      icon: "✅",
                    },
                    {
                      action: "falló el quiz",
                      user: "Roberto Díaz",
                      task: "Quiz: Reglas del fútbol",
                      time: "Hace 2 horas",
                      icon: "❌",
                    },
                  ].map((activity, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 py-2 border-b border-base-200 last:border-0"
                    >
                      <span className="text-lg">{activity.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="font-semibold">{activity.user}</span>{" "}
                          <span className="text-base-content/60">{activity.action}</span>{" "}
                          <span className="font-medium text-primary">{activity.task}</span>
                        </p>
                      </div>
                      <span className="text-xs text-base-content/40 shrink-0">
                        {activity.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Crear tarea */}
        {view === "create" && (
          <TaskForm
            onSubmit={handleCreate}
            onCancel={() => setView("dashboard")}
          />
        )}

        {/* Editar tarea */}
        {view === "edit" && editingTask && (
          <TaskForm
            initialData={{
              title: editingTask.title,
              description: editingTask.description,
              type: editingTask.type,
              difficulty: editingTask.difficulty,
              xp: editingTask.xp,
              category: editingTask.category,
              location: editingTask.location || "",
              deadline: editingTask.deadline || "",
              badge: editingTask.badge || "⭐",
              image: editingTask.image || "",
              active: editingTask.active,
            }}
            onSubmit={handleEdit}
            onCancel={() => {
              setEditingTask(null);
              setView("dashboard");
            }}
            isEditing
          />
        )}
      </div>
    </div>
  );
}
