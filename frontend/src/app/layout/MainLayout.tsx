import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import MemberPanel from "./MemberPanel";
import ChatView from "../chat/ChatView";
import VoiceCall from "../calls/VoiceCall";
import VideoCall from "../calls/VideoCall";
import IncomingCall from "../calls/IncomingCall";
import TaskBoard from "../tareas/TaskBoard";
import RewardsView from "../recompensas/RewardsView";
import AdminPanel from "../admin/AdminPanel";
import ProfilePage from "../perfil/ProfilePage";
import UserProfileModal from "../perfil/UserProfileModal";
import ServerExplorer from "../servers/ServerExplorer";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { getSocket } from "../../lib/socket";

interface ChannelMember {
  _id: string;
  displayName: string;
}

interface Channel {
  _id: string;
  name: string;
  type: "text" | "voice" | "video" | "dm";
  team: string;
  isDM: boolean;
  members?: ChannelMember[];
}

interface ServerInfo {
  _id: string;
  name: string;
  description?: string;
  visibility?: "public" | "private";
  isAdmin: boolean;
}

interface UnreadSummary {
  total: number;
  dmTotal: number;
  byChannel: Record<string, number>;
  byServer: Record<string, number>;
}

interface IncomingAlert {
  id: string;
  title: string;
  body: string;
}

type View = "chat" | "voice-call" | "video-call";
type Section = "chat" | "tasks" | "rewards" | "admin" | "servers" | "profile";

export default function MainLayout() {
  const { token, user } = useAuth();
  const [servers, setServers] = useState<ServerInfo[]>([]);
  const [activeTeam, setActiveTeam] = useState<string>("dms");
  const [activeChannel, setActiveChannel] = useState("");
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [showMembers, setShowMembers] = useState(true);
  const [currentView, setCurrentView] = useState<View>("chat");
  const [activeSection, setActiveSection] = useState<Section>("chat");
  const [showIncoming, setShowIncoming] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [incomingAlert, setIncomingAlert] = useState<IncomingAlert | null>(null);
  const [unreadByChannel, setUnreadByChannel] = useState<Record<string, number>>({});
  const [unreadByServer, setUnreadByServer] = useState<Record<string, number>>({});
  const [unreadDMTotal, setUnreadDMTotal] = useState(0);
  const [selectedProfileUserId, setSelectedProfileUserId] = useState<string | null>(null);

  const isDM = activeTeam === "dms";
  const activeServer = !isDM ? servers.find((s) => s._id === activeTeam) || null : null;
  const activeChannelMeta = channels.find((channel) => channel._id === activeChannelId) || null;
  const activeDmTargetUserId = isDM
    ? activeChannelMeta?.members?.find((member) => member._id !== user?._id)?._id
    : undefined;

  const loadServers = () => {
    if (!token) return;
    api<ServerInfo[]>("/servers", { token })
      .then((data) => {
        setServers(data);
        if (data.length > 0 && (activeTeam === "dms" || !data.some((s) => s._id === activeTeam))) {
          setActiveTeam(data[0]._id);
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    loadServers();
  }, [token]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    if (!incomingAlert) return;
    const timer = window.setTimeout(() => setIncomingAlert(null), 4200);
    return () => window.clearTimeout(timer);
  }, [incomingAlert]);

  useEffect(() => {
    if (!("Notification" in window)) return;
    if (Notification.permission !== "default") return;

    const onFirstInteraction = () => {
      Notification.requestPermission().catch(() => undefined);
      window.removeEventListener("click", onFirstInteraction);
      window.removeEventListener("keydown", onFirstInteraction);
    };

    window.addEventListener("click", onFirstInteraction, { once: true });
    window.addEventListener("keydown", onFirstInteraction, { once: true });

    return () => {
      window.removeEventListener("click", onFirstInteraction);
      window.removeEventListener("keydown", onFirstInteraction);
    };
  }, []);

  useEffect(() => {
    if (!token) return;

    api<UnreadSummary>("/channels/unread-summary", { token })
      .then((summary) => {
        setUnreadByChannel(summary.byChannel || {});
        setUnreadByServer(summary.byServer || {});
        setUnreadDMTotal(summary.dmTotal || 0);
      })
      .catch(console.error);
  }, [token]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleUnreadIncrement = (payload: {
      channelId: string;
      serverId?: string;
      amount?: number;
      senderName?: string;
      channelName?: string;
      isDM?: boolean;
      preview?: string;
    }) => {
      const amount = payload.amount || 1;

      if (payload.channelId && payload.channelId === activeChannelId) {
        return;
      }

      setUnreadByChannel((prev) => ({
        ...prev,
        [payload.channelId]: (prev[payload.channelId] || 0) + amount,
      }));

      const serverKey = payload.serverId;
      if (serverKey) {
        setUnreadByServer((prev) => ({
          ...prev,
          [serverKey]: (prev[serverKey] || 0) + amount,
        }));
      }

      if (serverKey === "dms") {
        setUnreadDMTotal((prev) => prev + amount);
      }

      const title = payload.isDM
        ? `Nuevo mensaje de ${payload.senderName || "usuario"}`
        : `Nuevo mensaje en #${payload.channelName || "canal"}`;
      const body = payload.preview?.trim() || "Tienes un nuevo mensaje";

      setIncomingAlert({
        id: `${Date.now()}-${payload.channelId}`,
        title,
        body,
      });

      if ("Notification" in window && Notification.permission === "granted") {
        const notification = new Notification(title, { body });
        window.setTimeout(() => notification.close(), 5000);
      }
    };

    const handleUnreadSummary = (summary: UnreadSummary) => {
      setUnreadByChannel(summary.byChannel || {});
      setUnreadByServer(summary.byServer || {});
      setUnreadDMTotal(summary.dmTotal || 0);
    };

    socket.on("unread:increment", handleUnreadIncrement);
    socket.on("unread:summary", handleUnreadSummary);

    return () => {
      socket.off("unread:increment", handleUnreadIncrement);
      socket.off("unread:summary", handleUnreadSummary);
    };
  }, [activeChannelId]);

  useEffect(() => {
    if (!token || !activeChannelId) return;

    api("/channels/" + activeChannelId + "/read", {
      token,
      method: "POST",
    })
      .then(() => {
        const previousChannelUnread = unreadByChannel[activeChannelId] || 0;
        if (previousChannelUnread === 0) return;

        const activeMeta = channels.find((ch) => ch._id === activeChannelId);
        const serverKey = activeMeta?.isDM ? "dms" : activeMeta?.team;

        setUnreadByChannel((prev) => ({
          ...prev,
          [activeChannelId]: 0,
        }));

        if (serverKey) {
          setUnreadByServer((prev) => ({
            ...prev,
            [serverKey]: Math.max(0, (prev[serverKey] || 0) - previousChannelUnread),
          }));
        }

        if (serverKey === "dms") {
          setUnreadDMTotal((prev) => Math.max(0, prev - previousChannelUnread));
        }
      })
      .catch(console.error);
  }, [activeChannelId, token, channels, unreadByChannel]);

  // Fetch channels when team changes
  useEffect(() => {
    if (!token || activeTeam === "dms") return;
    api<Channel[]>(`/channels?team=${activeTeam}`, { token })
      .then((data) => {
        setChannels(data);
        // Auto-select first text channel
        const first = data.find((c) => c.type === "text");
        if (first) {
          setActiveChannel(first.name);
          setActiveChannelId(first._id);
        }
      })
      .catch(console.error);
  }, [activeTeam, token]);

  // Update channelId when activeChannel name changes
  useEffect(() => {
    const ch = channels.find((c) => c.name === activeChannel);
    if (ch) setActiveChannelId(ch._id);
  }, [activeChannel, channels]);

  const channelType = isDM
    ? "dm" as const
    : (channels.find((c) => c._id === activeChannelId)?.type || "text") as
        | "text"
        | "voice"
        | "video"
        | "dm";

  const handleSectionChange = (section: string) => {
    setActiveSection(section as Section);
    if (section === "chat") {
      setCurrentView("chat");
    }
  };

  const handleTeamChange = (team: string) => {
    setActiveTeam(team);
    setActiveChannel("");
    setActiveChannelId(null);
    setShowMembers(team !== "dms");
    setCurrentView("chat");
    setActiveSection("chat");
  };

  const handleStartDM = (targetUserId: string, displayName: string) => {
    if (!token) return;
    api<Channel>("/channels/dm", {
      token,
      method: "POST",
      body: { targetUserId },
    })
      .then((channel) => {
        setActiveTeam("dms");
        setActiveChannel(displayName);
        setActiveChannelId(channel._id);
        setShowMembers(false);
        setCurrentView("chat");
        setActiveSection("chat");
      })
      .catch(console.error);
  };

  const handleCreateServer = (name: string, description: string) => {
    if (!token || !name.trim()) return;
    api<ServerInfo>("/servers", {
      token,
      method: "POST",
      body: { name: name.trim(), description: description.trim() },
    })
      .then((server) => {
        loadServers();
        handleTeamChange(server._id);
      })
      .catch((err) => {
        setToastMessage(err.message || "No se pudo crear el servidor");
      });
  };

  const profileServerId = activeServer?._id || servers[0]?._id || null;

  return (
    <div className="h-screen flex overflow-hidden bg-base-100">
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50">
          <div className="alert alert-error shadow-lg">
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {incomingAlert && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm">
          <div className="alert alert-info shadow-lg">
            <div>
              <p className="font-semibold text-sm">{incomingAlert.title}</p>
              <p className="text-xs opacity-90">{incomingAlert.body}</p>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <Sidebar
        servers={servers}
        activeTeam={activeTeam}
        activeServerName={activeServer?.name}
        activeChannel={activeChannel}
        activeChannelId={activeChannelId || undefined}
        activeSection={activeSection}
        channels={channels}
        unreadByChannel={unreadByChannel}
        unreadByServer={unreadByServer}
        unreadDMTotal={unreadDMTotal}
        onTeamChange={handleTeamChange}
        onChannelChange={(ch) => {
          setActiveChannel(ch.name);
          setActiveChannelId(ch._id);
          setCurrentView("chat");
          setActiveSection("chat");
        }}
        onDMsClick={() => {
          setActiveTeam("dms");
          setActiveChannel("");
          setActiveChannelId(null);
          setShowMembers(false);
          setCurrentView("chat");
          setActiveSection("chat");
        }}
        canManageServer={!!activeServer?.isAdmin}
        onStartDM={handleStartDM}
        onCreateServer={handleCreateServer}
        onViewProfile={(userId) => setSelectedProfileUserId(userId)}
        onSectionChange={handleSectionChange}
      />

      {/* Área principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar — solo visible en sección de chat */}
        {activeSection === "chat" && activeChannelId && (
          <Topbar
            channelName={activeChannel}
            channelType={channelType}
            showMembers={showMembers}
            onToggleMembers={() => setShowMembers(!showMembers)}
            onCallClick={() => setCurrentView("voice-call")}
            onVideoClick={() => setCurrentView("video-call")}
            showMemberToggle={!isDM}
            compactActions={isDM}
          />
        )}

        {/* Contenido */}
        <div className="flex-1 flex min-h-0">
          <div className="flex-1 min-w-0">
            {activeSection === "chat" && (
              <>
                {currentView === "chat" && (
                  activeChannelId ? (
                    <ChatView
                      channelName={activeChannel}
                      channelId={activeChannelId || undefined}
                      isDM={isDM}
                      targetUserId={activeDmTargetUserId}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center max-w-md p-6">
                        <p className="text-4xl mb-3">💬</p>
                        <h3 className="text-xl font-bold mb-1">
                          {isDM ? "Selecciona un chat directo" : "Selecciona un canal"}
                        </h3>
                        <p className="text-base-content/50 text-sm">
                          {isDM
                            ? "Elige una persona de la lista de mensajes directos para comenzar la conversación."
                            : "Selecciona un canal del servidor para ver mensajes y actividad."}
                        </p>
                      </div>
                    </div>
                  )
                )}
                {currentView === "voice-call" && (
                  <VoiceCall
                    callerName={isDM ? activeChannel : "Sala de voz"}
                    onHangUp={() => setCurrentView("chat")}
                  />
                )}
                {currentView === "video-call" && (
                  <VideoCall onHangUp={() => setCurrentView("chat")} />
                )}
              </>
            )}
            {activeSection === "rewards" && (
              <RewardsView serverId={activeServer?._id || null} serverName={activeServer?.name || ""} />
            )}
            {activeSection === "tasks" && <TaskBoard serverId={activeServer?._id || null} serverName={activeServer?.name || ""} />}
            {activeSection === "admin" && (
              <AdminPanel
                serverId={activeServer?._id || null}
                serverName={activeServer?.name || ""}
                serverDescription={activeServer?.description || ""}
                isServerAdmin={!!activeServer?.isAdmin}
              />
            )}
            {activeSection === "servers" && (
              <ServerExplorer
                onJoined={(serverId) => {
                  loadServers();
                  handleTeamChange(serverId);
                }}
              />
            )}
            {activeSection === "profile" && <ProfilePage serverId={profileServerId} />}
          </div>

          {/* Panel de miembros (solo en vista de chat) */}
          {activeSection === "chat" && currentView === "chat" && !isDM && (
            <MemberPanel
              visible={showMembers}
              serverId={activeServer?._id}
              onViewProfile={(userId) => setSelectedProfileUserId(userId)}
            />
          )}
        </div>
      </div>

      {selectedProfileUserId && (
        <UserProfileModal
          userId={selectedProfileUserId}
          serverId={profileServerId}
          onClose={() => setSelectedProfileUserId(null)}
        />
      )}

      {/* Modal de llamada entrante (demo) */}
      {showIncoming && (
        <IncomingCall
          callerName="Ana Torres"
          callType="video"
          onAccept={() => {
            setShowIncoming(false);
            setCurrentView("video-call");
            setActiveSection("chat");
          }}
          onDecline={() => setShowIncoming(false)}
        />
      )}
    </div>
  );
}
