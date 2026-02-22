import { useState } from "react";
import type { AdminTask } from "./types";
import {
  taskTypeLabels,
  taskTypeEmojis,
  difficultyLabels,
  difficultyColors,
} from "./types";
import type { Task } from "../tareas/types";

interface TaskManagerProps {
  tasks: AdminTask[];
  onEdit: (task: AdminTask) => void;
  onToggleActive: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onCreate: () => void;
}

export default function TaskManager({
  tasks,
  onEdit,
  onToggleActive,
  onDelete,
  onCreate,
}: TaskManagerProps) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<Task["type"] | "all">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [sortBy, setSortBy] = useState<"date" | "xp" | "completions">("date");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filteredTasks = tasks
    .filter((t) => {
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterType !== "all" && t.type !== filterType) return false;
      if (filterStatus === "active" && !t.active) return false;
      if (filterStatus === "inactive" && t.active) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "xp") return b.xp - a.xp;
      if (sortBy === "completions") return b.completedBy - a.completedBy;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="space-y-4">
      {/* Barra de acciones */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Búsqueda */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Buscar tarea..."
              className="input input-bordered input-sm pl-9 w-56"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filtro tipo */}
          <select
            className="select select-bordered select-sm"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as Task["type"] | "all")}
          >
            <option value="all">Todos los tipos</option>
            {(["visit", "photo", "quiz", "social", "challenge"] as Task["type"][]).map((type) => (
              <option key={type} value={type}>
                {taskTypeEmojis[type]} {taskTypeLabels[type]}
              </option>
            ))}
          </select>

          {/* Filtro estado */}
          <select
            className="select select-bordered select-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as "all" | "active" | "inactive")}
          >
            <option value="all">Todos los estados</option>
            <option value="active">✅ Activas</option>
            <option value="inactive">⏸️ Inactivas</option>
          </select>

          {/* Ordenar */}
          <select
            className="select select-bordered select-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "date" | "xp" | "completions")}
          >
            <option value="date">Más recientes</option>
            <option value="xp">Mayor XP</option>
            <option value="completions">Más completadas</option>
          </select>
        </div>

        <button onClick={onCreate} className="btn btn-primary btn-sm gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nueva tarea
        </button>
      </div>

      {/* Contador de resultados */}
      <p className="text-sm text-base-content/50">
        {filteredTasks.length} de {tasks.length} tarea{tasks.length !== 1 && "s"}
      </p>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-xl border border-base-300">
        <table className="table table-sm">
          <thead className="bg-base-200">
            <tr>
              <th className="w-12">Estado</th>
              <th>Tarea</th>
              <th className="w-24">Tipo</th>
              <th className="w-24">Dificultad</th>
              <th className="w-20 text-center">XP</th>
              <th className="w-28 text-center">Completadas</th>
              <th className="w-28">Fecha creación</th>
              <th className="w-28 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-base-content/40">
                  <div className="flex flex-col items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                    <p>No se encontraron tareas</p>
                    <button onClick={onCreate} className="btn btn-primary btn-sm mt-2">
                      Crear primera tarea
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredTasks.map((task) => (
                <tr key={task.id} className="hover">
                  {/* Toggle activo */}
                  <td>
                    <input
                      type="checkbox"
                      className="toggle toggle-success toggle-sm"
                      checked={task.active}
                      onChange={() => onToggleActive(task.id)}
                    />
                  </td>

                  {/* Tarea */}
                  <td>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{task.badge || "⭐"}</span>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate max-w-xs">
                          {task.title}
                        </p>
                        <p className="text-xs text-base-content/40 truncate max-w-xs">
                          {task.description}
                        </p>
                        {task.location && (
                          <p className="text-xs text-base-content/30 flex items-center gap-1 mt-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                            </svg>
                            {task.location}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Tipo */}
                  <td>
                    <span className="badge badge-sm badge-ghost gap-1">
                      {taskTypeEmojis[task.type]}
                      {taskTypeLabels[task.type]}
                    </span>
                  </td>

                  {/* Dificultad */}
                  <td>
                    <span className={`badge badge-sm ${difficultyColors[task.difficulty]}`}>
                      {difficultyLabels[task.difficulty]}
                    </span>
                  </td>

                  {/* XP */}
                  <td className="text-center">
                    <span className="font-semibold text-sm">⚡ {task.xp}</span>
                  </td>

                  {/* Completadas */}
                  <td className="text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-medium">
                        {task.completedBy}/{task.totalParticipants}
                      </span>
                      <progress
                        className="progress progress-primary w-16 h-1.5"
                        value={task.totalParticipants > 0 ? (task.completedBy / task.totalParticipants) * 100 : 0}
                        max="100"
                      />
                    </div>
                  </td>

                  {/* Fecha */}
                  <td>
                    <span className="text-xs text-base-content/50">{task.createdAt}</span>
                  </td>

                  {/* Acciones */}
                  <td>
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onEdit(task)}
                        className="btn btn-ghost btn-xs btn-square tooltip"
                        data-tip="Editar"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                      </button>
                      {confirmDelete === task.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              onDelete(task.id);
                              setConfirmDelete(null);
                            }}
                            className="btn btn-error btn-xs"
                          >
                            Sí
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="btn btn-ghost btn-xs"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(task.id)}
                          className="btn btn-ghost btn-xs btn-square text-error/60 hover:text-error tooltip"
                          data-tip="Eliminar"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
