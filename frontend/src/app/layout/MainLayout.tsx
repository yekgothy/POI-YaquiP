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
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";

interface Channel {
  _id: string;
  name: string;
  type: "text" | "voice" | "video" | "dm";
  team: string;
  isDM: boolean;
}

type View = "chat" | "voice-call" | "video-call";
type Section = "chat" | "tasks" | "rewards" | "admin" | "profile";

export default function MainLayout() {
  const { token } = useAuth();
  const [activeTeam, setActiveTeam] = useState("mundial-2026");
  const [activeChannel, setActiveChannel] = useState("general");
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [showMembers, setShowMembers] = useState(true);
  const [currentView, setCurrentView] = useState<View>("chat");
  const [activeSection, setActiveSection] = useState<Section>("chat");
  const [showIncoming, setShowIncoming] = useState(false);

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

  const isDM = activeTeam === "dms";

  const channelType = isDM
    ? "dm" as const
    : activeChannel.includes("voz") || activeChannel.includes("voice")
    ? "voice" as const
    : activeChannel.includes("transmisión") || activeChannel.includes("reunión")
    ? "video" as const
    : "text" as const;

  const handleSectionChange = (section: string) => {
    setActiveSection(section as Section);
    if (section === "chat") {
      setCurrentView("chat");
    }
  };

  const handleTeamChange = (team: string) => {
    setActiveTeam(team);
    setActiveChannel(team === "dms" ? "Carlos Vela" : "general");
    setCurrentView("chat");
    setActiveSection("chat");
  };

  return (
    <div className="h-screen flex overflow-hidden bg-base-100">
      {/* Sidebar */}
      <Sidebar
        activeTeam={activeTeam}
        activeChannel={activeChannel}
        activeSection={activeSection}
        channels={channels}
        onTeamChange={handleTeamChange}
        onChannelChange={(ch) => {
          setActiveChannel(ch);
          setCurrentView("chat");
          setActiveSection("chat");
        }}
        onDMsClick={() => {
          setActiveTeam("dms");
          setActiveChannel("Carlos Vela");
          setCurrentView("chat");
          setActiveSection("chat");
        }}
        onSectionChange={handleSectionChange}
      />

      {/* Área principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar — solo visible en sección de chat */}
        {activeSection === "chat" && (
          <Topbar
            channelName={activeChannel}
            channelType={channelType}
            showMembers={showMembers}
            onToggleMembers={() => setShowMembers(!showMembers)}
            onCallClick={() => setCurrentView("voice-call")}
            onVideoClick={() => setCurrentView("video-call")}
          />
        )}

        {/* Contenido */}
        <div className="flex-1 flex min-h-0">
          <div className="flex-1 min-w-0">
            {activeSection === "chat" && (
              <>
                {currentView === "chat" && (
                  <ChatView channelName={activeChannel} channelId={activeChannelId || undefined} isDM={isDM} />
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
            {activeSection === "tasks" && <TaskBoard />}
            {activeSection === "rewards" && <RewardsView />}
            {activeSection === "admin" && <AdminPanel />}
            {activeSection === "profile" && <ProfilePage />}
          </div>

          {/* Panel de miembros (solo en vista de chat) */}
          {activeSection === "chat" && currentView === "chat" && (
            <MemberPanel visible={showMembers} />
          )}
        </div>
      </div>

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
