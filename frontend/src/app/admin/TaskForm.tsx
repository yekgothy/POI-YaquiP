import { useState } from "react";
import type { TaskFormData } from "./types";
import {
  emptyFormData,
  taskTypeLabels,
  taskTypeEmojis,
  difficultyLabels,
  categoryOptions,
  badgeOptions,
} from "./types";
import type { Task } from "../tareas/types";

interface TaskFormProps {
  initialData?: TaskFormData;
  onSubmit: (data: TaskFormData) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export default function TaskForm({
  initialData,
  onSubmit,
  onCancel,
  isEditing = false,
}: TaskFormProps) {
  const [form, setForm] = useState<TaskFormData>(initialData || emptyFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof TaskFormData, string>>>({});

  const update = <K extends keyof TaskFormData>(key: K, value: TaskFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof TaskFormData, string>> = {};
    if (!form.title.trim()) newErrors.title = "El título es obligatorio";
    if (form.title.length > 80) newErrors.title = "Máximo 80 caracteres";
    if (!form.description.trim()) newErrors.description = "La descripción es obligatoria";
    if (form.xp < 10) newErrors.xp = "Mínimo 10 XP";
    if (form.xp > 10000) newErrors.xp = "Máximo 10,000 XP";
    if (!form.category) newErrors.category = "Selecciona una categoría";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(form);
    }
  };

  const typeOptions: Task["type"][] = ["visit", "photo", "quiz", "social", "challenge"];
  const difficultyOptions: Task["difficulty"][] = ["easy", "medium", "hard", "legendary"];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {isEditing ? "Editar tarea" : "Crear nueva tarea"}
          </h2>
          <p className="text-sm text-base-content/50 mt-1">
            {isEditing
              ? "Modifica los detalles de la tarea"
              : "Define una nueva misión para los participantes"}
          </p>
        </div>
        <button type="button" onClick={onCancel} className="btn btn-ghost btn-sm gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Volver
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-5">
          {/* Información básica */}
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body gap-4">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
                Información básica
              </h3>

              {/* Título */}
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text font-medium">Título de la tarea *</span>
                  <span className="label-text-alt text-base-content/40">{form.title.length}/80</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej: Visita el Estadio Azteca"
                  className={`input input-bordered w-full ${errors.title ? "input-error" : ""}`}
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                  maxLength={80}
                />
                {errors.title && <p className="text-error text-xs mt-1">{errors.title}</p>}
              </div>

              {/* Descripción */}
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text font-medium">Descripción *</span>
                </label>
                <textarea
                  placeholder="Describe la tarea en detalle: qué deben hacer los participantes, requisitos, etc."
                  className={`textarea textarea-bordered w-full min-h-28 ${errors.description ? "textarea-error" : ""}`}
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                />
                {errors.description && <p className="text-error text-xs mt-1">{errors.description}</p>}
              </div>

              {/* Ubicación */}
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text font-medium">Ubicación</span>
                  <span className="label-text-alt text-base-content/40">Opcional</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Ej: Estadio Azteca, Ciudad de México"
                    className="input input-bordered w-full pl-9"
                    value={form.location}
                    onChange={(e) => update("location", e.target.value)}
                  />
                </div>
              </div>

              {/* URL de Imagen */}
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text font-medium">URL de imagen de portada</span>
                  <span className="label-text-alt text-base-content/40">Opcional</span>
                </label>
                <input
                  type="url"
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className="input input-bordered w-full"
                  value={form.image}
                  onChange={(e) => update("image", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Tipo y dificultad */}
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body gap-4">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
                </svg>
                Tipo y clasificación
              </h3>

              {/* Tipo de tarea */}
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text font-medium">Tipo de tarea *</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {typeOptions.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => update("type", type)}
                      className={`btn btn-sm h-auto py-3 flex flex-col gap-1 ${
                        form.type === type
                          ? "btn-primary"
                          : "btn-ghost border border-base-300"
                      }`}
                    >
                      <span className="text-lg">{taskTypeEmojis[type]}</span>
                      <span className="text-xs">{taskTypeLabels[type]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dificultad */}
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text font-medium">Dificultad *</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {difficultyOptions.map((diff) => {
                    const colorMap = {
                      easy: "btn-success",
                      medium: "btn-warning",
                      hard: "btn-error",
                      legendary: "btn-secondary",
                    };
                    const stars = { easy: "★", medium: "★★", hard: "★★★", legendary: "★★★★" };
                    return (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => update("difficulty", diff)}
                        className={`btn btn-sm h-auto py-3 flex flex-col gap-1 ${
                          form.difficulty === diff
                            ? colorMap[diff]
                            : "btn-ghost border border-base-300"
                        }`}
                      >
                        <span className="text-xs">{stars[diff]}</span>
                        <span className="text-xs">{difficultyLabels[diff]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Categoría */}
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text font-medium">Categoría *</span>
                </label>
                <select
                  className={`select select-bordered w-full ${errors.category ? "select-error" : ""}`}
                  value={form.category}
                  onChange={(e) => update("category", e.target.value)}
                >
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {errors.category && <p className="text-error text-xs mt-1">{errors.category}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Columna lateral */}
        <div className="space-y-5">
          {/* Recompensa y fecha */}
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body gap-4">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                </svg>
                Recompensa
              </h3>

              {/* XP */}
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text font-medium">Puntos XP *</span>
                </label>
                <input
                  type="number"
                  placeholder="100"
                  className={`input input-bordered w-full ${errors.xp ? "input-error" : ""}`}
                  value={form.xp}
                  onChange={(e) => update("xp", Number(e.target.value))}
                  min={10}
                  max={10000}
                  step={10}
                />
                {errors.xp && <p className="text-error text-xs mt-1">{errors.xp}</p>}
                <div className="flex justify-between mt-2">
                  {[50, 100, 200, 500].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => update("xp", v)}
                      className={`btn btn-xs ${form.xp === v ? "btn-primary" : "btn-ghost"}`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Badge */}
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text font-medium">Insignia</span>
                </label>
                <div className="grid grid-cols-8 gap-1">
                  {badgeOptions.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => update("badge", emoji)}
                      className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${
                        form.badge === emoji
                          ? "bg-primary/20 ring-2 ring-primary scale-110"
                          : "hover:bg-base-200"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fecha límite */}
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text font-medium">Fecha límite</span>
                  <span className="label-text-alt text-base-content/40">Opcional</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered w-full"
                  value={form.deadline}
                  onChange={(e) => update("deadline", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Estado */}
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body gap-3">
              <h3 className="font-semibold text-base">Estado</h3>
              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-3">
                  <input
                    type="checkbox"
                    className="toggle toggle-success"
                    checked={form.active}
                    onChange={(e) => update("active", e.target.checked)}
                  />
                  <div>
                    <span className="label-text font-medium">
                      {form.active ? "Activa" : "Inactiva"}
                    </span>
                    <p className="text-xs text-base-content/40">
                      {form.active
                        ? "Los usuarios pueden ver y completar esta tarea"
                        : "La tarea está oculta para los usuarios"}
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body gap-3">
              <h3 className="font-semibold text-base">Vista previa</h3>
              <div className="bg-base-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{form.badge || "⭐"}</span>
                  <div>
                    <p className="font-bold text-sm">
                      {form.title || "Título de la tarea"}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-xs">{taskTypeEmojis[form.type]}</span>
                      <span className="text-xs text-base-content/50">
                        {taskTypeLabels[form.type]}
                      </span>
                      <span className="text-xs text-base-content/30 mx-1">•</span>
                      <span className="text-xs text-base-content/50">
                        {difficultyLabels[form.difficulty]}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-base-content/60 line-clamp-2">
                  {form.description || "Descripción de la tarea..."}
                </p>
                <div className="flex items-center justify-between text-xs text-base-content/40">
                  <span>⚡ {form.xp} XP</span>
                  {form.location && (
                    <span className="flex items-center gap-1">
                      📍 {form.location}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-base-300">
        <button type="button" onClick={onCancel} className="btn btn-ghost">
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
          {isEditing ? "Guardar cambios" : "Crear tarea"}
        </button>
      </div>
    </form>
  );
}
