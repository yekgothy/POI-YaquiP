import { useState } from "react";
import TeamIcon from "../components/TeamIcon";
import ChannelItem from "../components/ChannelItem";
import UserAvatar from "../components/UserAvatar";
import { useAuth } from "../../context/AuthContext";
import { useOnlineUsers } from "../../hooks/useOnlineUsers";

interface ApiChannel {
  _id: string;
  name: string;
  type: "text" | "voice" | "video" | "dm";
  team: string;
  isDM: boolean;
}

interface ServerInfo {
  _id: string;
  name: string;
  description?: string;
}

interface SidebarProps {
  servers: ServerInfo[];
  activeTeam: string;
  activeServerName?: string;
  canManageServer?: boolean;
  activeChannel: string;
  activeChannelId?: string;
  activeSection?: string;
  channels?: ApiChannel[];
  unreadByChannel?: Record<string, number>;
  unreadByServer?: Record<string, number>;
  unreadDMTotal?: number;
  onTeamChange: (team: string) => void;
  onChannelChange: (channel: ApiChannel) => void;
  onDMsClick: () => void;
  onStartDM: (targetUserId: string, displayName: string) => void;
  onCreateServer: (name: string, description: string) => void;
  onViewProfile?: (userId: string) => void;
  onSectionChange?: (section: string) => void;
  collapsed?: boolean;
}

export default function Sidebar({
  servers,
  activeTeam,
  activeServerName,
  canManageServer = false,
  activeChannel,
  activeChannelId,
  activeSection = "chat",
  channels: apiChannels,
  unreadByChannel = {},
  unreadByServer = {},
  unreadDMTotal = 0,
  onTeamChange,
  onChannelChange,
  onDMsClick,
  onStartDM,
  onCreateServer,
  onViewProfile,
  onSectionChange,
  collapsed = false,
}: SidebarProps) {
  const { user, logout } = useAuth();
  const [showCreateServer, setShowCreateServer] = useState(false);
  const [serverName, setServerName] = useState("");
  const [serverDescription, setServerDescription] = useState("");
  const { users: allUsers } = useOnlineUsers(activeTeam !== "dms" ? activeTeam : undefined);

  const sidebarChannels = apiChannels || [];

  return (
    <div className="flex h-full">
      {/* Barra de equipos (siempre visible) */}
      <div className="w-18 bg-base-300/80 flex flex-col items-center py-3 gap-2 border-r border-base-300">
        {/* Inicio */}
        <div className="mb-2 relative">
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
          {unreadDMTotal > 0 && (
            <span className="absolute -top-1 -right-1 badge badge-error badge-xs text-[10px] font-bold min-w-4.5">
              {unreadDMTotal > 99 ? "99+" : unreadDMTotal}
            </span>
          )}
        </div>

        <div className="w-8 h-px bg-base-content/10 mb-1" />

        {/* Servidores */}
        {servers.map((team) => (
            <TeamIcon
              key={team._id}
              name={team.name}
              emoji="🌍"
              active={activeTeam === team._id}
              unread={unreadByServer[team._id] || 0}
              onClick={() => onTeamChange(team._id)}
            />
          ))}

        {/* Separador */}
        <div className="w-8 h-px bg-base-content/10 mt-1 mb-1" />

        {/* Explorar servidores */}
        <div className="tooltip tooltip-right" data-tip="Explorar servidores">
          <button
            onClick={() => onSectionChange?.("servers")}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 hover:rounded-xl ${
              activeSection === "servers"
                ? "bg-info text-info-content rounded-xl shadow-lg shadow-info/30"
                : "bg-base-100 text-info/60 hover:bg-info/20 hover:text-info"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 0 1 .75.75v3h3a.75.75 0 0 1 0 1.5h-3v3a.75.75 0 0 1-1.5 0v-3h-3a.75.75 0 0 1 0-1.5h3v-3a.75.75 0 0 1 .75-.75Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </button>
        </div>

        {/* Botón agregar servidor */}
        <div className="mt-auto">
          <button
            onClick={() => setShowCreateServer(true)}
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-success/60 bg-base-100 hover:bg-success/20 hover:text-success hover:rounded-xl transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>
      </div>

      {showCreateServer && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl bg-base-100 border border-base-300 shadow-xl">
            <div className="p-4 border-b border-base-300">
              <h3 className="font-bold text-lg">Crear servidor</h3>
              <p className="text-sm text-base-content/50">Configura nombre y descripción inicial</p>
            </div>
            <div className="p-4 space-y-3">
              <label className="form-control w-full">
                <span className="label-text">Nombre</span>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={serverName}
                  onChange={(e) => setServerName(e.target.value)}
                  placeholder="Ej. Comunidad CDMX"
                />
              </label>
              <label className="form-control w-full">
                <span className="label-text">Descripción</span>
                <textarea
                  className="textarea textarea-bordered w-full"
                  value={serverDescription}
                  onChange={(e) => setServerDescription(e.target.value)}
                  placeholder="Describe propósito o reglas del servidor"
                />
              </label>
            </div>
            <div className="p-4 border-t border-base-300 flex justify-end gap-2">
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setShowCreateServer(false);
                  setServerName("");
                  setServerDescription("");
                }}
              >
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (!serverName.trim()) return;
                  onCreateServer(serverName, serverDescription);
                  setShowCreateServer(false);
                  setServerName("");
                  setServerDescription("");
                }}
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Panel de canales */}
      {!collapsed && (
        <div className="w-60 bg-base-200 flex flex-col border-r border-base-300">
          {/* Nombre del equipo */}
          <div className="h-14 px-4 flex items-center justify-between border-b border-base-300 shrink-0">
            <h2 className="font-bold text-base-content truncate">
              {activeTeam === "dms" ? "Mensajes directos" : activeServerName || "Servidor"}
            </h2>
            <button className="btn btn-ghost btn-xs btn-circle">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
              </svg>
            </button>
          </div>

          {activeTeam !== "dms" && (
            <div className="px-2 py-2 border-b border-base-300 flex gap-1 flex-wrap">
              <button
                onClick={() => onSectionChange?.("chat")}
                className={`btn btn-xs ${activeSection === "chat" ? "btn-primary" : "btn-ghost"}`}
              >
                Chat
              </button>
              <button
                onClick={() => onSectionChange?.("tasks")}
                className={`btn btn-xs ${activeSection === "tasks" ? "btn-primary" : "btn-ghost"}`}
              >
                Tareas
              </button>
              <button
                onClick={() => onSectionChange?.("rewards")}
                className={`btn btn-xs ${activeSection === "rewards" ? "btn-primary" : "btn-ghost"}`}
              >
                Recompensas
              </button>
              {canManageServer && (
                <button
                  onClick={() => onSectionChange?.("admin")}
                  className={`btn btn-xs ${activeSection === "admin" ? "btn-primary" : "btn-ghost"}`}
                >
                  Admin
                </button>
              )}
            </div>
          )}

          {/* Lista de canales */}
          {activeTeam !== "dms" ? (
            <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
              {/* Canales de texto */}
              <div className="mb-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-base-content/40 px-2 mb-1">
                  Canales de texto
                </p>
                {sidebarChannels
                  .filter((c) => c.type === "text")
                  .map((ch) => (
                    <ChannelItem
                      key={ch._id}
                      name={ch.name}
                      type={ch.type as "text" | "voice" | "video"}
                      active={activeChannelId === ch._id || activeChannel === ch.name}
                      unread={unreadByChannel[ch._id] || 0}
                      onClick={() => onChannelChange(ch)}
                    />
                  ))}
              </div>

              {/* Canales de voz/video */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-base-content/40 px-2 mb-1">
                  Canales de voz
                </p>
                {sidebarChannels
                  .filter((c) => c.type === "voice" || c.type === "video")
                  .map((ch) => (
                    <ChannelItem
                      key={ch._id}
                      name={ch.name}
                      type={ch.type as "text" | "voice" | "video"}
                      active={activeChannelId === ch._id || activeChannel === ch.name}
                      unread={unreadByChannel[ch._id] || 0}
                      onClick={() => onChannelChange(ch)}
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
              {allUsers.length === 0 ? (
                <p className="text-xs text-base-content/30 px-2 py-4 text-center">
                  No hay otros usuarios registrados
                </p>
              ) : (
                allUsers.map((u) => (
                  <div
                    key={u._id}
                    className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-colors ${
                      activeChannel === u.displayName
                        ? "bg-primary/15 text-primary"
                        : "hover:bg-base-300/50"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onStartDM(u._id, u.displayName)}
                      className="flex items-center gap-3 min-w-0 flex-1"
                    >
                      <UserAvatar name={u.displayName} src={u.avatar} size="sm" online={u.online} />
                      <div className="text-left min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{u.displayName}</p>
                        <p className="text-xs text-base-content/40 truncate">
                          {u.online ? "En línea" : "Desconectado"}
                        </p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => onViewProfile?.(u._id)}
                      className="btn btn-ghost btn-xs btn-circle"
                      aria-label="Ver perfil"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12c0 1.242.275 2.419.767 3.474A11.955 11.955 0 0 0 12 21.75c3.133 0 5.975-1.204 8.233-3.176.492-1.055.767-2.232.767-3.474 0-1.243-.275-2.42-.767-3.475A11.955 11.955 0 0 0 12 2.25c-3.133 0-5.975 1.204-8.233 3.176A8.978 8.978 0 0 0 2.25 12Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Barra de usuario actual (inferior) */}
          <div className="h-14 px-2 flex items-center gap-2 border-t border-base-300 bg-base-300/30 shrink-0">
            <button
              onClick={() => {
                if (user?._id) {
                  onViewProfile?.(user._id);
                } else {
                  onSectionChange?.("profile");
                }
              }}
              className="flex items-center gap-2 flex-1 min-w-0 hover:bg-base-300/50 rounded-lg px-1 py-1 transition-colors"
            >
              <UserAvatar
                name={user?.displayName || "Tú"}
                src={user?.avatar || ""}
                size="sm"
                online={true}
              />
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-semibold truncate">{user?.displayName || "Usuario"}</p>
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
            <div className="tooltip tooltip-top" data-tip="Cerrar sesión">
              <button
                onClick={logout}
                className="btn btn-ghost btn-xs btn-circle text-error/60 hover:text-error hover:bg-error/10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
