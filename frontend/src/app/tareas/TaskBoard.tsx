import { useEffect, useMemo, useState } from "react";
import TaskCard from "./TaskCard";
import TaskDetail from "./TaskDetail";
import QuizView from "./QuizView";
import type { Task } from "./types";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

const statusFilters = ["Todas", "Disponible", "En progreso", "Completada"];

type SubView = "board" | "detail" | "quiz";

type ToastType = "success" | "error";

interface ToastState {
  type: ToastType;
  message: string;
}

interface TaskBoardProps {
  serverId: string | null;
  serverName: string;
}

export default function TaskBoard({ serverId, serverName }: TaskBoardProps) {
  const { token } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [selectedStatus, setSelectedStatus] = useState("Todas");
  const [subView, setSubView] = useState<SubView>("board");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [levelUpModal, setLevelUpModal] = useState<{ from: number; to: number } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!token || !serverId) {
      setTasks([]);
      return;
    }

    setLoading(true);
    api<Task[]>(`/servers/${serverId}/tasks`, { token })
      .then(setTasks)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token, serverId]);

  const categories = useMemo(() => {
    const dynamic = [...new Set(tasks.map((t) => t.category).filter(Boolean))];
    return ["Todas", ...dynamic];
  }, [tasks]);

  const statusMap: Record<string, string> = {
    Disponible: "available",
    "En progreso": "in-progress",
    Completada: "completed",
  };

  const filtered = tasks.filter((t) => {
    if (selectedCategory !== "Todas" && t.category !== selectedCategory) return false;
    if (selectedStatus !== "Todas" && t.status !== statusMap[selectedStatus]) return false;
    return true;
  });

  const handleTaskClick = (task: Task) => {
    if (task.status === "locked") return;
    setSelectedTask(task);
    setSubView("detail");
  };

  const completeTask = async (task: Task) => {
    if (!token || !serverId || task.status === "completed") return;
    setCompletingTaskId(task.id);
    try {
      const completion = await api<{ awardedXp: number; levelUp?: boolean; previousLevel?: number; newLevel?: number }>(
        `/servers/${serverId}/tasks/${task.id}/complete`,
        { token, method: "POST" }
      );

      setTasks((prev) =>
        prev.map((current) =>
          current.id === task.id ? { ...current, status: "completed" } : current
        )
      );
      setSelectedTask((prev) => (prev && prev.id === task.id ? { ...prev, status: "completed" } : prev));
      setSubView("board");
      setSelectedTask(null);
      setToast({ type: "success", message: `Tarea completada: +${completion.awardedXp} XP` });

      if (completion.levelUp && completion.previousLevel && completion.newLevel) {
        setLevelUpModal({ from: completion.previousLevel, to: completion.newLevel });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "No se pudo completar la tarea";
      setToast({ type: "error", message: msg });
    } finally {
      setCompletingTaskId(null);
    }
  };

  if (subView === "quiz" && selectedTask) {
    return (
      <QuizView
        title={selectedTask.title}
        questions={[]}
        onFinish={() => {
          void completeTask(selectedTask);
        }}
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
            return;
          }

          void completeTask(selectedTask);
        }}
        isSubmitting={completingTaskId === selectedTask.id}
      />
    );
  }

  // Contar stats
  const inProgress = tasks.filter((t) => t.status === "in-progress").length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const totalXp = tasks.filter((t) => t.status === "completed").reduce((s, t) => s + t.xp, 0);

  if (!serverId) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center">
          <div className="mb-2 flex justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-base-content/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 8.25A2.25 2.25 0 0 1 6 6h12a2.25 2.25 0 0 1 2.25 2.25v7.5A2.25 2.25 0 0 1 18 18H6a2.25 2.25 0 0 1-2.25-2.25v-7.5Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 12h9" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.125v3.75" />
            </svg>
          </div>
          <p className="text-base-content/60">Selecciona un servidor para ver sus tareas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto relative">
      {toast && (
        <div className="fixed top-4 right-4 z-40">
          <div
            role="status"
            className={`alert shadow-lg ${toast.type === "success" ? "alert-success" : "alert-error"}`}
          >
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {levelUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-[2px] p-4">
          <div className="w-full max-w-md rounded-2xl bg-base-100 border border-warning/30 shadow-2xl p-6 text-center animate-in">
            <div className="mb-3 flex justify-center animate-bounce">
              <span className="w-14 h-14 rounded-full bg-warning/15 text-warning flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-1.813-.905a1.875 1.875 0 0 0-2.626 2.126l.47 2.074 2.074.47a1.875 1.875 0 0 0 2.126-2.626L8.25 18l2.846-.813m0 0 3.657-3.657a4.5 4.5 0 0 0-6.364-6.364L4.732 10.822a4.5 4.5 0 0 0 6.364 6.364Z" />
                </svg>
              </span>
            </div>
            <h3 className="text-2xl font-extrabold text-warning">¡Subiste de nivel!</h3>
            <p className="mt-2 text-base-content/70">
              Pasaste de nivel <span className="font-bold">{levelUpModal.from}</span> a nivel <span className="font-bold">{levelUpModal.to}</span>
            </p>
            <div className="mt-5 flex justify-center gap-2">
              <span className="badge badge-warning badge-lg">Nivel {levelUpModal.to}</span>
            </div>
            <button className="btn btn-primary mt-6" onClick={() => setLevelUpModal(null)}>
              Seguir jugando
            </button>
          </div>
        </div>
      )}

      {/* Header heroico */}
      <div className="bg-linear-to-r from-primary/10 via-secondary/5 to-accent/10 px-6 py-6 border-b border-base-300">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-base-content flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 8.25A2.25 2.25 0 0 1 6 6h12a2.25 2.25 0 0 1 2.25 2.25v7.5A2.25 2.25 0 0 1 18 18H6a2.25 2.25 0 0 1-2.25-2.25v-7.5Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 12h9" />
              </svg>
              Misiones del Mundial
            </h1>
            <p className="text-sm text-base-content/50 mt-1">
              Tareas del servidor: {serverName || "Servidor"}
            </p>
          </div>
        </div>

        {/* Stats rápidos */}
        <div className="flex gap-4 flex-wrap">
          <div className="flex items-center gap-2 bg-base-100/80 backdrop-blur rounded-lg px-3 py-2 shadow-sm">
            <span className="text-warning">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75c2.25 2.25 3.75 4.5 3.75 6.75a3.75 3.75 0 1 1-7.5 0c0-2.25 1.5-4.5 3.75-6.75Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a2.25 2.25 0 0 0 2.25-2.25c0-.978-.49-1.815-1.188-2.484A5.927 5.927 0 0 1 12 12.75a5.927 5.927 0 0 1-1.063-2.489A3.466 3.466 0 0 0 9.75 12.75 2.25 2.25 0 0 0 12 15Z" />
              </svg>
            </span>
            <div>
              <p className="text-xs text-base-content/40">En progreso</p>
              <p className="font-bold text-sm">{inProgress} misiones</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-base-100/80 backdrop-blur rounded-lg px-3 py-2 shadow-sm">
            <span className="text-success">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </span>
            <div>
              <p className="text-xs text-base-content/40">Completadas</p>
              <p className="font-bold text-sm">{completed} misiones</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-base-100/80 backdrop-blur rounded-lg px-3 py-2 shadow-sm">
            <span className="text-warning">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 3 4.5 14.25h6L9.75 21l9-11.25h-6L13.5 3Z" />
              </svg>
            </span>
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
          {loading && <p className="text-sm text-base-content/60">Cargando tareas...</p>}
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
            <div className="mb-3 flex justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-base-content/35" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35m0 0A7.5 7.5 0 1 0 6.4 6.4a7.5 7.5 0 0 0 10.25 10.25Z" />
              </svg>
            </div>
            <p className="text-base-content/40">No hay misiones con esos filtros</p>
          </div>
        )}
      </div>
    </div>
  );
}
