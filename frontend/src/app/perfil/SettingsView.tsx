import { useState } from "react";
import type { AppSettings } from "./types";
import { defaultSettings, themeOptions } from "./types";

interface SettingsViewProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
}

type SettingsTab = "appearance" | "notifications" | "privacy" | "accessibility" | "account";

export default function SettingsView({ settings, onSave }: SettingsViewProps) {
  const [current, setCurrent] = useState<AppSettings>(settings);
  const [activeTab, setActiveTab] = useState<SettingsTab>("appearance");
  const [saved, setSaved] = useState(false);

  const update = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setCurrent((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const updateNested = <K extends keyof AppSettings>(
    section: K,
    key: string,
    value: unknown
  ) => {
    setCurrent((prev) => ({
      ...prev,
      [section]: { ...(prev[section] as Record<string, unknown>), [key]: value },
    }));
    setSaved(false);
  };

  const handleSave = () => {
    onSave(current);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setCurrent(defaultSettings);
    setSaved(false);
  };

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    {
      id: "appearance",
      label: "Apariencia",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z" />
        </svg>
      ),
    },
    {
      id: "notifications",
      label: "Notificaciones",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
        </svg>
      ),
    },
    {
      id: "privacy",
      label: "Privacidad",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
        </svg>
      ),
    },
    {
      id: "accessibility",
      label: "Accesibilidad",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802" />
        </svg>
      ),
    },
    {
      id: "account",
      label: "Cuenta",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
        </svg>
      ),
    },
  ];

  const langOptions: { id: AppSettings["language"]; label: string; flag: string }[] = [
    { id: "es", label: "Español", flag: "🇪🇸" },
    { id: "en", label: "English", flag: "🇺🇸" },
    { id: "pt", label: "Português", flag: "🇧🇷" },
    { id: "fr", label: "Français", flag: "🇫🇷" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-base-200 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-base-content/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold">Configuración</h1>
            <p className="text-sm text-base-content/50">Personaliza tu experiencia</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="text-success text-sm font-medium flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              Guardado
            </span>
          )}
          <button onClick={handleReset} className="btn btn-ghost btn-sm">
            Restaurar
          </button>
          <button onClick={handleSave} className="btn btn-primary btn-sm gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
            Guardar
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar tabs */}
        <div className="w-48 shrink-0 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-primary/10 text-primary"
                  : "text-base-content/60 hover:bg-base-200 hover:text-base-content"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* Apariencia */}
          {activeTab === "appearance" && (
            <>
              {/* Tema */}
              <div className="card bg-base-100 border border-base-300 shadow-sm">
                <div className="card-body gap-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    🎨 Tema
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {themeOptions.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => update("theme", theme.id)}
                        className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                          current.theme === theme.id
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-base-300 hover:border-base-content/20"
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full ${theme.preview} ring-2 ring-base-300`} />
                        <span className="text-xs font-medium">{theme.name}</span>
                        {current.theme === theme.id && (
                          <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary text-primary-content flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Idioma */}
              <div className="card bg-base-100 border border-base-300 shadow-sm">
                <div className="card-body gap-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    🌐 Idioma
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {langOptions.map((lang) => (
                      <button
                        key={lang.id}
                        onClick={() => update("language", lang.id)}
                        className={`btn btn-sm h-auto py-3 ${
                          current.language === lang.id ? "btn-primary" : "btn-ghost border border-base-300"
                        }`}
                      >
                        <span className="text-lg">{lang.flag}</span>
                        <span className="text-xs">{lang.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Interfaz */}
              <div className="card bg-base-100 border border-base-300 shadow-sm">
                <div className="card-body gap-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    ⚙️ Interfaz
                  </h3>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <p className="text-sm font-medium">Modo compacto</p>
                        <p className="text-xs text-base-content/40">Reduce el espaciado entre elementos</p>
                      </div>
                      <input
                        type="checkbox"
                        className="toggle toggle-primary"
                        checked={current.compactMode}
                        onChange={(e) => update("compactMode", e.target.checked)}
                      />
                    </label>
                    <div className="divider my-0" />
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <p className="text-sm font-medium">Animaciones</p>
                        <p className="text-xs text-base-content/40">Transiciones y efectos visuales</p>
                      </div>
                      <input
                        type="checkbox"
                        className="toggle toggle-primary"
                        checked={current.animationsEnabled}
                        onChange={(e) => update("animationsEnabled", e.target.checked)}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Notificaciones */}
          {activeTab === "notifications" && (
            <div className="card bg-base-100 border border-base-300 shadow-sm">
              <div className="card-body gap-4">
                <h3 className="font-semibold flex items-center gap-2">
                  🔔 Notificaciones
                </h3>
                <div className="space-y-4">
                  {([
                    { key: "messages", label: "Mensajes nuevos", desc: "Recibe notificación de cada mensaje nuevo" },
                    { key: "mentions", label: "Menciones", desc: "Cuando alguien te menciona en un mensaje" },
                    { key: "tasks", label: "Tareas", desc: "Nuevas tareas disponibles o cambios en las tuyas" },
                    { key: "rewards", label: "Recompensas", desc: "Cuando desbloqueas trofeos o subes de nivel" },
                    { key: "calls", label: "Llamadas entrantes", desc: "Notificación de llamadas de voz y video" },
                    { key: "sounds", label: "Sonidos", desc: "Efectos de sonido para notificaciones" },
                    { key: "desktop", label: "Escritorio", desc: "Notificaciones del sistema operativo" },
                  ] as const).map((item, i) => (
                    <div key={item.key}>
                      <label className="flex items-center justify-between cursor-pointer">
                        <div>
                          <p className="text-sm font-medium">{item.label}</p>
                          <p className="text-xs text-base-content/40">{item.desc}</p>
                        </div>
                        <input
                          type="checkbox"
                          className="toggle toggle-primary"
                          checked={current.notifications[item.key]}
                          onChange={(e) => updateNested("notifications", item.key, e.target.checked)}
                        />
                      </label>
                      {i < 6 && <div className="divider my-0" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Privacidad */}
          {activeTab === "privacy" && (
            <div className="card bg-base-100 border border-base-300 shadow-sm">
              <div className="card-body gap-4">
                <h3 className="font-semibold flex items-center gap-2">
                  🛡️ Privacidad
                </h3>
                <div className="space-y-4">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <p className="text-sm font-medium">Mostrar estado en línea</p>
                      <p className="text-xs text-base-content/40">Los demás pueden ver si estás conectado</p>
                    </div>
                    <input
                      type="checkbox"
                      className="toggle toggle-primary"
                      checked={current.privacy.showOnlineStatus}
                      onChange={(e) => updateNested("privacy", "showOnlineStatus", e.target.checked)}
                    />
                  </label>

                  <div className="divider my-0" />

                  <div>
                    <p className="text-sm font-medium mb-1">¿Quién puede ver mi perfil?</p>
                    <p className="text-xs text-base-content/40 mb-3">Controla quién puede ver tu información</p>
                    <div className="flex gap-2">
                      {([
                        { id: "everyone" as const, label: "Todos", icon: "🌍" },
                        { id: "team" as const, label: "Mi equipo", icon: "👥" },
                        { id: "nobody" as const, label: "Nadie", icon: "🔒" },
                      ]).map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => updateNested("privacy", "showProfile", opt.id)}
                          className={`btn btn-sm flex-1 ${
                            current.privacy.showProfile === opt.id ? "btn-primary" : "btn-ghost border border-base-300"
                          }`}
                        >
                          {opt.icon} {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="divider my-0" />

                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <p className="text-sm font-medium">Mostrar estadísticas</p>
                      <p className="text-xs text-base-content/40">XP, nivel, racha y ranking visible</p>
                    </div>
                    <input
                      type="checkbox"
                      className="toggle toggle-primary"
                      checked={current.privacy.showStats}
                      onChange={(e) => updateNested("privacy", "showStats", e.target.checked)}
                    />
                  </label>

                  <div className="divider my-0" />

                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <p className="text-sm font-medium">Mostrar actividad</p>
                      <p className="text-xs text-base-content/40">Tu actividad reciente en el perfil</p>
                    </div>
                    <input
                      type="checkbox"
                      className="toggle toggle-primary"
                      checked={current.privacy.showActivity}
                      onChange={(e) => updateNested("privacy", "showActivity", e.target.checked)}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Accesibilidad */}
          {activeTab === "accessibility" && (
            <div className="card bg-base-100 border border-base-300 shadow-sm">
              <div className="card-body gap-4">
                <h3 className="font-semibold flex items-center gap-2">
                  ♿ Accesibilidad
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Tamaño de fuente</p>
                    <p className="text-xs text-base-content/40 mb-3">Ajusta el tamaño del texto en la aplicación</p>
                    <div className="grid grid-cols-4 gap-2">
                      {([
                        { id: "small" as const, label: "Pequeño", sample: "text-xs" },
                        { id: "normal" as const, label: "Normal", sample: "text-sm" },
                        { id: "large" as const, label: "Grande", sample: "text-base" },
                        { id: "xlarge" as const, label: "Muy grande", sample: "text-lg" },
                      ]).map((size) => (
                        <button
                          key={size.id}
                          onClick={() => updateNested("accessibility", "fontSize", size.id)}
                          className={`btn btn-sm h-auto py-3 flex flex-col gap-1 ${
                            current.accessibility.fontSize === size.id
                              ? "btn-primary"
                              : "btn-ghost border border-base-300"
                          }`}
                        >
                          <span className={size.sample}>Aa</span>
                          <span className="text-[10px]">{size.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="divider my-0" />

                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <p className="text-sm font-medium">Alto contraste</p>
                      <p className="text-xs text-base-content/40">Mayor contraste entre elementos</p>
                    </div>
                    <input
                      type="checkbox"
                      className="toggle toggle-primary"
                      checked={current.accessibility.highContrast}
                      onChange={(e) => updateNested("accessibility", "highContrast", e.target.checked)}
                    />
                  </label>

                  <div className="divider my-0" />

                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <p className="text-sm font-medium">Reducir movimiento</p>
                      <p className="text-xs text-base-content/40">Desactiva animaciones y transiciones</p>
                    </div>
                    <input
                      type="checkbox"
                      className="toggle toggle-primary"
                      checked={current.accessibility.reducedMotion}
                      onChange={(e) => updateNested("accessibility", "reducedMotion", e.target.checked)}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Cuenta */}
          {activeTab === "account" && (
            <div className="space-y-5">
              <div className="card bg-base-100 border border-base-300 shadow-sm">
                <div className="card-body gap-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    🔑 Seguridad
                  </h3>
                  <div className="space-y-3">
                    <button className="btn btn-ghost btn-sm justify-start gap-2 w-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                      </svg>
                      Cambiar contraseña
                    </button>
                    <button className="btn btn-ghost btn-sm justify-start gap-2 w-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0 1 19.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 0 0 4.5 10.5a7.464 7.464 0 0 1-1.15 3.993m1.989 3.559A11.209 11.209 0 0 0 8.25 10.5a3.75 3.75 0 1 1 7.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 0 1-3.6 9.75m6.633-4.596a18.666 18.666 0 0 1-2.485 5.33" />
                      </svg>
                      Autenticación de dos factores
                    </button>
                    <button className="btn btn-ghost btn-sm justify-start gap-2 w-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                      </svg>
                      Sesiones activas
                    </button>
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 border border-error/30 shadow-sm">
                <div className="card-body gap-3">
                  <h3 className="font-semibold text-error flex items-center gap-2">
                    ⚠️ Zona de peligro
                  </h3>
                  <p className="text-sm text-base-content/50">
                    Estas acciones son irreversibles. Procede con cuidado.
                  </p>
                  <div className="flex gap-2">
                    <button className="btn btn-outline btn-error btn-sm">
                      Desactivar cuenta
                    </button>
                    <button className="btn btn-error btn-sm">
                      Eliminar cuenta
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
