export interface Task {
  id: string;
  title: string;
  description: string;
  type: "visit" | "photo" | "quiz" | "social" | "challenge";
  difficulty: "easy" | "medium" | "hard" | "legendary";
  xp: number;
  status: "available" | "in-progress" | "completed" | "locked";
  progress?: number; // 0-100
  maxProgress?: number;
  deadline?: string;
  location?: string;
  image?: string;
  badge?: string; // emoji reward
  category: string;
}

export interface Trophy {
  id: string;
  name: string;
  description: string;
  emoji: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

export interface UserStats {
  level: number;
  xp: number;
  xpToNext: number;
  tasksCompleted: number;
  totalTasks: number;
  trophies: number;
  streak: number;
  rank: number;
}
