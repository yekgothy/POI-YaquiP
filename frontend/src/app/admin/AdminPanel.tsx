import { useEffect, useState } from "react";
import AdminStats from "./AdminStats";
import TaskManager from "./TaskManager";
import TaskForm from "./TaskForm";
import ServerSettings from "./ServerSettings";
import type { AdminTask, TaskFormData } from "./types";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

type AdminView = "dashboard" | "create" | "edit";

interface AdminPanelProps {
  serverId: string | null;
  serverName: string;
  serverDescription: string;
  isServerAdmin: boolean;
}

export default function AdminPanel({
  serverId,
  serverName,
  serverDescription,
  isServerAdmin,
}: AdminPanelProps) {
  const { token } = useAuth();
  const [localServerName, setLocalServerName] = useState(serverName);
  const [localServerDescription, setLocalServerDescription] = useState(serverDescription);
  const [tasks, setTasks] = useState<AdminTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<AdminView>("dashboard");
  const [editingTask, setEditingTask] = useState<AdminTask | null>(null);

  useEffect(() => {
    if (!token || !serverId || !isServerAdmin) {
      setTasks([]);
      return;
    }

    setLoading(true);
    api<AdminTask[]>(`/servers/${serverId}/admin/tasks`, { token })
      .then(setTasks)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token, serverId, isServerAdmin]);

  useEffect(() => {
    setLocalServerName(serverName);
    setLocalServerDescription(serverDescription || "");
  }, [serverName, serverDescription]);

  const activeTasks = tasks.filter((t) => t.active).length;
  const totalCompletions = tasks.reduce((sum, t) => sum + t.completedBy, 0);
  const totalParticipants = tasks.reduce((sum, t) => sum + t.totalParticipants, 0);

  const handleCreate = async (data: TaskFormData) => {
    if (!token || !serverId) return;
    const created = await api<AdminTask>(`/servers/${serverId}/admin/tasks`, {
      token,
      method: "POST",
      body: data,
    });
    setTasks((prev) => [created, ...prev]);
    setView("dashboard");
  };

  const handleEdit = async (data: TaskFormData) => {
    if (!editingTask) return;
    if (!token || !serverId) return;
    const updated = await api<AdminTask>(`/servers/${serverId}/admin/tasks/${editingTask.id}`, {
      token,
      method: "PUT",
      body: data,
    });
    setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? updated : t)));
    setEditingTask(null);
    setView("dashboard");
  };

  const handleToggleActive = async (taskId: string) => {
    if (!token || !serverId) return;
    const target = tasks.find((t) => t.id === taskId);
    if (!target) return;
    const updated = await api<AdminTask>(`/servers/${serverId}/admin/tasks/${taskId}/active`, {
      token,
      method: "PATCH",
      body: { active: !target.active },
    });
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
  };

  const handleDelete = async (taskId: string) => {
    if (!token || !serverId) return;
    await api<void>(`/servers/${serverId}/admin/tasks/${taskId}`, {
      token,
      method: "DELETE",
    });
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const startEdit = (task: AdminTask) => {
    setEditingTask(task);
    setView("edit");
  };

  if (!serverId) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <p className="text-base-content/60">Selecciona un servidor para administrar tareas</p>
      </div>
    );
  }

  if (!isServerAdmin) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <p className="text-base-content/60">Solo los administradores del servidor pueden crear tareas</p>
      </div>
    );
  }

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
                    Gestiona las tareas del servidor: {localServerName || "Servidor"}
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

            {/* Gestión de servidor */}
            <ServerSettings
              serverId={serverId}
              initialName={localServerName}
              initialDescription={localServerDescription}
              onServerUpdated={({ name, description }) => {
                setLocalServerName(name);
                setLocalServerDescription(description);
              }}
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
                {loading && <p className="text-sm text-base-content/50">Cargando actividad...</p>}
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
