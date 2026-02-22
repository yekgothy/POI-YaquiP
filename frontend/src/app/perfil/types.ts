export interface UserProfile {
  id: string;
  displayName: string;
  username: string;
  email: string;
  bio: string;
  avatar?: string;
  banner?: string;
  favoriteTeam: string;
  country: string;
  city: string;
  joinedAt: string;
  online: boolean;
  level: number;
  xp: number;
  xpToNext: number;
  tasksCompleted: number;
  trophiesUnlocked: number;
  streak: number;
  rank: number;
  badges: ProfileBadge[];
  socialLinks: SocialLink[];
}

export interface ProfileBadge {
  id: string;
  emoji: string;
  name: string;
  description: string;
  earnedAt: string;
}

export interface SocialLink {
  platform: "twitter" | "instagram" | "tiktok" | "youtube" | "website";
  url: string;
}

export interface AppSettings {
  theme: "autumn" | "dark" | "light" | "cupcake" | "dracula" | "night" | "coffee";
  language: "es" | "en" | "pt" | "fr";
  accentColor: string;
  compactMode: boolean;
  animationsEnabled: boolean;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  accessibility: AccessibilitySettings;
}

export interface NotificationSettings {
  messages: boolean;
  mentions: boolean;
  tasks: boolean;
  rewards: boolean;
  calls: boolean;
  sounds: boolean;
  desktop: boolean;
}

export interface PrivacySettings {
  showOnlineStatus: boolean;
  showProfile: "everyone" | "team" | "nobody";
  showStats: boolean;
  showActivity: boolean;
}

export interface AccessibilitySettings {
  fontSize: "small" | "normal" | "large" | "xlarge";
  highContrast: boolean;
  reducedMotion: boolean;
}

export const defaultProfile: UserProfile = {
  id: "user-1",
  displayName: "Usuario",
  username: "usuario_mundialista",
  email: "usuario@ejemplo.com",
  bio: "¡Emocionado por el Mundial 2026! ⚽🇲🇽",
  favoriteTeam: "México",
  country: "México",
  city: "Ciudad de México",
  joinedAt: "2026-01-10",
  online: true,
  level: 12,
  xp: 4200,
  xpToNext: 5000,
  tasksCompleted: 16,
  trophiesUnlocked: 4,
  streak: 5,
  rank: 5,
  badges: [
    { id: "b1", emoji: "🏟️", name: "Explorador", description: "Visitó su primer estadio", earnedAt: "2026-01-20" },
    { id: "b2", emoji: "🧠", name: "Sabio", description: "Completó 5 quizzes", earnedAt: "2026-01-28" },
    { id: "b3", emoji: "🔥", name: "En racha", description: "Racha de 5 días", earnedAt: "2026-02-15" },
    { id: "b4", emoji: "📸", name: "Fotógrafo", description: "Subió 10 fotos", earnedAt: "2026-02-18" },
  ],
  socialLinks: [
    { platform: "twitter", url: "https://twitter.com/usuario" },
    { platform: "instagram", url: "https://instagram.com/usuario" },
  ],
};

export const defaultSettings: AppSettings = {
  theme: "autumn",
  language: "es",
  accentColor: "primary",
  compactMode: false,
  animationsEnabled: true,
  notifications: {
    messages: true,
    mentions: true,
    tasks: true,
    rewards: true,
    calls: true,
    sounds: true,
    desktop: true,
  },
  privacy: {
    showOnlineStatus: true,
    showProfile: "everyone",
    showStats: true,
    showActivity: true,
  },
  accessibility: {
    fontSize: "normal",
    highContrast: false,
    reducedMotion: false,
  },
};

export const themeOptions: { id: AppSettings["theme"]; name: string; preview: string }[] = [
  { id: "autumn", name: "Otoño", preview: "bg-[#8C0327]" },
  { id: "dark", name: "Oscuro", preview: "bg-[#1d232a]" },
  { id: "light", name: "Claro", preview: "bg-[#ffffff]" },
  { id: "cupcake", name: "Cupcake", preview: "bg-[#65c3c8]" },
  { id: "dracula", name: "Drácula", preview: "bg-[#ff79c6]" },
  { id: "night", name: "Noche", preview: "bg-[#3abff8]" },
  { id: "coffee", name: "Café", preview: "bg-[#DB924B]" },
];

export const countryFlags: Record<string, string> = {
  "México": "🇲🇽",
  "Estados Unidos": "🇺🇸",
  "Canadá": "🇨🇦",
  "Argentina": "🇦🇷",
  "Brasil": "🇧🇷",
  "España": "🇪🇸",
  "Alemania": "🇩🇪",
  "Francia": "🇫🇷",
  "Inglaterra": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  "Portugal": "🇵🇹",
  "Japón": "🇯🇵",
  "Corea del Sur": "🇰🇷",
};
