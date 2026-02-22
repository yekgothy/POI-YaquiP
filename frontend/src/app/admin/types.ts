import type { Task } from "../tareas/types";

export interface AdminTask extends Task {
  createdAt: string;
  createdBy: string;
  active: boolean;
  completedBy: number; // cuántos usuarios la completaron
  totalParticipants: number; // cuántos la están intentando
}

export interface TaskFormData {
  title: string;
  description: string;
  type: Task["type"];
  difficulty: Task["difficulty"];
  xp: number;
  category: string;
  location: string;
  deadline: string;
  badge: string;
  image: string;
  active: boolean;
}

export const emptyFormData: TaskFormData = {
  title: "",
  description: "",
  type: "visit",
  difficulty: "easy",
  xp: 100,
  category: "Sedes",
  location: "",
  deadline: "",
  badge: "⭐",
  image: "",
  active: true,
};

export const taskTypeLabels: Record<Task["type"], string> = {
  visit: "Visita",
  photo: "Foto",
  quiz: "Quiz",
  social: "Social",
  challenge: "Desafío",
};

export const taskTypeEmojis: Record<Task["type"], string> = {
  visit: "📍",
  photo: "📸",
  quiz: "🧠",
  social: "👥",
  challenge: "🏆",
};

export const difficultyLabels: Record<Task["difficulty"], string> = {
  easy: "Fácil",
  medium: "Media",
  hard: "Difícil",
  legendary: "Legendaria",
};

export const difficultyColors: Record<Task["difficulty"], string> = {
  easy: "badge-success",
  medium: "badge-warning",
  hard: "badge-error",
  legendary: "badge-secondary",
};

export const categoryOptions = [
  "Sedes",
  "Conocimiento",
  "Arte",
  "Social",
  "Desafíos",
  "Cultura",
  "Gastronomía",
  "Historia",
];

export const badgeOptions = [
  "⭐", "🏟️", "📸", "🧠", "👥", "🏆", "🎨", "⚽",
  "🥇", "🎯", "🔥", "🌎", "🇲🇽", "🇺🇸", "🇨🇦", "🎉",
];
