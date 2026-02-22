import TeamIcon from "../components/TeamIcon";
import ChannelItem from "../components/ChannelItem";
import UserAvatar from "../components/UserAvatar";

interface SidebarProps {
  activeTeam: string;
  activeChannel: string;
  activeSection?: string;
  onTeamChange: (team: string) => void;
  onChannelChange: (channel: string) => void;
  onDMsClick: () => void;
  onSectionChange?: (section: string) => void;
  collapsed?: boolean;
}

const teams = [
  { id: "dms", name: "Mensajes directos", emoji: "💬" },
  { id: "mundial-2026", name: "Mundial 2026", emoji: "⚽" },
  { id: "grupo-a", name: "Grupo A", emoji: "🅰️" },
  { id: "staff", name: "Staff", emoji: "🛡️" },
];

const channelsByTeam: Record<string, { name: string; type: "text" | "voice" | "video"; unread?: number }[]> = {
  "mundial-2026": [
    { name: "general", type: "text", unread: 3 },
    { name: "alineaciones", type: "text" },
    { name: "resultados", type: "text", unread: 12 },
    { name: "predicciones", type: "text" },
    { name: "tribuna-voz", type: "voice" },
    { name: "transmisión", type: "video" },
  ],
  "grupo-a": [
    { name: "general", type: "text", unread: 5 },
    { name: "estrategia", type: "text" },
    { name: "sala-voz", type: "voice" },
    { name: "reunión", type: "video" },
  ],
  staff: [
    { name: "anuncios", type: "text", unread: 1 },
    { name: "coordinación", type: "text" },
    { name: "privado-voz", type: "voice" },
  ],
};

export default function Sidebar({
  activeTeam,
  activeChannel,
  activeSection = "chat",
  onTeamChange,
  onChannelChange,
  onDMsClick,
  onSectionChange,
  collapsed = false,
}: SidebarProps) {
  const channels = channelsByTeam[activeTeam] || [];

  return (
    <div className="flex h-full">
      {/* Barra de equipos (siempre visible) */}
      <div className="w-[72px] bg-base-300/80 flex flex-col items-center py-3 gap-2 border-r border-base-300">
        {/* Inicio */}
        <div className="mb-2">
          <button
            onClick={onDMsClick}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 hover:rounded-xl ${
              activeTeam === "dms"
                ? "bg-primary text-primary-content rounded-xl shadow-lg shadow-primary/30"
                : "bg-base-100 text-primary hover:bg-primary/20"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
            </svg>
          </button>
        </div>

        <div className="w-8 h-px bg-base-content/10 mb-1" />

        {/* Equipos */}
        {teams
          .filter((t) => t.id !== "dms")
          .map((team) => (
            <TeamIcon
              key={team.id}
              name={team.name}
              emoji={team.emoji}
              active={activeTeam === team.id}
              unread={
                channelsByTeam[team.id]?.reduce((sum, ch) => sum + (ch.unread || 0), 0) || 0
              }
              onClick={() => onTeamChange(team.id)}
            />
          ))}

        {/* Separador */}
        <div className="w-8 h-px bg-base-content/10 mt-1 mb-1" />

        {/* Misiones */}
        <div className="tooltip tooltip-right" data-tip="Misiones">
          <button
            onClick={() => onSectionChange?.("tasks")}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 hover:rounded-xl ${
              activeSection === "tasks"
                ? "bg-warning text-warning-content rounded-xl shadow-lg shadow-warning/30"
                : "bg-base-100 text-warning/60 hover:bg-warning/20 hover:text-warning"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75" />
            </svg>
          </button>
        </div>

        {/* Recompensas */}
        <div className="tooltip tooltip-right" data-tip="Recompensas">
          <button
            onClick={() => onSectionChange?.("rewards")}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 hover:rounded-xl ${
              activeSection === "rewards"
                ? "bg-accent text-accent-content rounded-xl shadow-lg shadow-accent/30"
                : "bg-base-100 text-accent/60 hover:bg-accent/20 hover:text-accent"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0 1 16.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 0 1-2.77.704 6.023 6.023 0 0 1-2.77-.704" />
            </svg>
          </button>
        </div>

        {/* Panel Admin */}
        <div className="tooltip tooltip-right" data-tip="Administración">
          <button
            onClick={() => onSectionChange?.("admin")}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 hover:rounded-xl ${
              activeSection === "admin"
                ? "bg-error text-error-content rounded-xl shadow-lg shadow-error/30"
                : "bg-base-100 text-error/50 hover:bg-error/20 hover:text-error"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </button>
        </div>

        {/* Botón agregar */}
        <div className="mt-auto">
          <button className="w-12 h-12 rounded-2xl flex items-center justify-center text-success/60 bg-base-100 hover:bg-success/20 hover:text-success hover:rounded-xl transition-all duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Panel de canales */}
      {!collapsed && (
        <div className="w-60 bg-base-200 flex flex-col border-r border-base-300">
          {/* Nombre del equipo */}
          <div className="h-14 px-4 flex items-center justify-between border-b border-base-300 shrink-0">
            <h2 className="font-bold text-base-content truncate">
              {teams.find((t) => t.id === activeTeam)?.name || "Mensajes"}
            </h2>
            <button className="btn btn-ghost btn-xs btn-circle">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
              </svg>
            </button>
          </div>

          {/* Lista de canales */}
          {activeTeam !== "dms" ? (
            <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
              {/* Canales de texto */}
              <div className="mb-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-base-content/40 px-2 mb-1">
                  Canales de texto
                </p>
                {channels
                  .filter((c) => c.type === "text")
                  .map((ch) => (
                    <ChannelItem
                      key={ch.name}
                      name={ch.name}
                      type={ch.type}
                      active={activeChannel === ch.name}
                      unread={ch.unread}
                      onClick={() => onChannelChange(ch.name)}
                    />
                  ))}
              </div>

              {/* Canales de voz/video */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-base-content/40 px-2 mb-1">
                  Canales de voz
                </p>
                {channels
                  .filter((c) => c.type === "voice" || c.type === "video")
                  .map((ch) => (
                    <ChannelItem
                      key={ch.name}
                      name={ch.name}
                      type={ch.type}
                      active={activeChannel === ch.name}
                      unread={ch.unread}
                      onClick={() => onChannelChange(ch.name)}
                    />
                  ))}
              </div>
            </div>
          ) : (
            /* Lista de DMs */
            <div className="flex-1 overflow-y-auto p-2">
              <div className="mb-2">
                <input
                  type="text"
                  placeholder="Buscar conversación..."
                  className="input input-sm input-bordered w-full bg-base-300/50"
                />
              </div>
              {[
                { name: "Carlos Vela", online: true },
                { name: "Ana Torres", online: true },
                { name: "Miguel Herrera", online: false },
                { name: "Lucía Méndez", online: true },
                { name: "Roberto Díaz", online: false },
              ].map((user) => (
                <button
                  key={user.name}
                  onClick={() => onChannelChange(user.name)}
                  className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-colors ${
                    activeChannel === user.name
                      ? "bg-primary/15 text-primary"
                      : "hover:bg-base-300/50"
                  }`}
                >
                  <UserAvatar name={user.name} size="sm" online={user.online} />
                  <div className="text-left min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-base-content/40 truncate">
                      {user.online ? "En línea" : "Desconectado"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Barra de usuario actual (inferior) */}
          <div className="h-14 px-2 flex items-center gap-2 border-t border-base-300 bg-base-300/30 shrink-0">
            <button
              onClick={() => onSectionChange?.("profile")}
              className="flex items-center gap-2 flex-1 min-w-0 hover:bg-base-300/50 rounded-lg px-1 py-1 transition-colors"
            >
              <UserAvatar name="Tú" size="sm" online={true} />
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-semibold truncate">Usuario</p>
                <p className="text-[10px] text-success">En línea</p>
              </div>
            </button>
            <button
              onClick={() => onSectionChange?.("profile")}
              className={`btn btn-ghost btn-xs btn-circle ${
                activeSection === "profile" ? "text-primary" : ""
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
