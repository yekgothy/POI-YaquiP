import { useEffect, useRef } from "react";
import { useMediasoupCall } from "../../hooks/useMediasoupCall";
import { useCall } from "../../context/CallContext";
import CallControls from "./CallControls";

interface DailyCallProps {
  callId: string;
  roomName: string;
  onHangUp?: () => void;
}

function VideoTile({
  stream,
  title,
  muted = false,
  mirrored = false,
}: {
  stream: MediaStream | null;
  title: string;
  muted?: boolean;
  mirrored?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative rounded-2xl overflow-hidden bg-base-300/20 border border-white/10 min-h-48">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className={`w-full h-full object-cover bg-black ${mirrored ? "scale-x-[-1]" : ""}`}
      />
      <div className="absolute left-3 bottom-3 px-2 py-1 rounded-md bg-black/60 text-xs text-white">
        {title}
      </div>
    </div>
  );
}

export function DailyCall({ callId, roomName, onHangUp }: DailyCallProps) {
  const { activeCall, endCall, leaveActiveCall } = useCall();
  const {
    isReady,
    localStream,
    remoteParticipants,
    isCameraOn,
    isMicOn,
    error,
    toggleCamera,
    toggleMic,
    leaveCall: leaveMediaCall,
  } = useMediasoupCall({ callId });

  const handleHangUp = async () => {
    await leaveMediaCall();
    if (activeCall?.callType === "group") {
      leaveActiveCall();
      onHangUp?.();
      return;
    }

    await endCall();
    onHangUp?.();
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-neutral">
        <div className="text-center">
          <p className="text-error text-lg font-semibold">Error en la llamada</p>
          <p className="text-neutral-content/60 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-neutral">
      {/* Header */}
      <div className="h-12 px-4 flex items-center justify-between bg-neutral/80 backdrop-blur shrink-0 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-sm font-medium text-neutral-content/80">
            {activeCall?.callType === "direct" ? "Videollamada individual" : "Videollamada grupal"}
          </span>
          <span className="text-xs text-neutral-content/40">En vivo</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-neutral-content/50">
            {remoteParticipants.length + (localStream ? 1 : 0)} participantes
          </span>
        </div>
      </div>

      {/* Main video area */}
      <div className="flex-1 bg-black relative overflow-hidden p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full auto-rows-fr">
          {localStream && (
            <VideoTile stream={localStream} title="Tú" muted mirrored />
          )}

          {remoteParticipants.map((participant) => (
            <VideoTile
              key={participant.peerId}
              stream={participant.stream}
              title={participant.displayName}
            />
          ))}
        </div>

        {/* Loading state */}
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="text-center">
              <div className="animate-spin">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full" />
              </div>
              <p className="mt-4 text-neutral-content">Conectando...</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <CallControls
        camera={isCameraOn}
        mic={isMicOn}
        onToggleCamera={toggleCamera}
        onToggleMic={toggleMic}
        onHangUp={handleHangUp}
        showShare={false}
      />
    </div>
  );
}
