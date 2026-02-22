import { useState } from "react";
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

type View = "chat" | "voice-call" | "video-call";
type Section = "chat" | "tasks" | "rewards" | "admin" | "profile";

export default function MainLayout() {
  const [activeTeam, setActiveTeam] = useState("mundial-2026");
  const [activeChannel, setActiveChannel] = useState("general");
  const [showMembers, setShowMembers] = useState(true);
  const [currentView, setCurrentView] = useState<View>("chat");
  const [activeSection, setActiveSection] = useState<Section>("chat");
  const [showIncoming, setShowIncoming] = useState(true);

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
                  <ChatView channelName={activeChannel} isDM={isDM} />
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
