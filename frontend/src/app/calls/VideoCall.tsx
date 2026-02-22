import { useState } from "react";
import UserAvatar from "../components/UserAvatar";
import CallControls from "./CallControls";

interface VideoCallProps {
  participants?: string[];
  onHangUp: () => void;
}

const defaultParticipants = [
  "Carlos Vela",
  "Ana Torres",
  "Lucía Méndez",
  "Pedro Ramírez",
];

export default function VideoCall({
  participants = defaultParticipants,
  onHangUp,
}: VideoCallProps) {
  const [mic, setMic] = useState(true);
  const [camera, setCamera] = useState(true);
  const [sharing, setSharing] = useState(false);

  // Decidir el layout del grid según los participantes
  const gridCols =
    participants.length <= 1
      ? "grid-cols-1"
      : participants.length <= 4
      ? "grid-cols-2"
      : "grid-cols-3";

  return (
    <div className="flex flex-col h-full bg-neutral">
      {/* Header con info de la llamada */}
      <div className="h-12 px-4 flex items-center justify-between bg-neutral/80 backdrop-blur shrink-0 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
          <span className="text-sm font-medium text-neutral-content/80">
            Videollamada grupal
          </span>
          <span className="text-xs text-neutral-content/40">• 12:45</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-neutral-content/50">
            {participants.length + 1} participantes
          </span>
        </div>
      </div>

      {/* Grid de video */}
      <div className={`flex-1 grid ${gridCols} gap-2 p-2 auto-rows-fr`}>
        {/* Tu video (siempre primero) */}
        <div className="relative bg-base-300 rounded-xl overflow-hidden group">
          {camera ? (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <UserAvatar name="Tú" size="xl" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </div>
          ) : (
            <div className="absolute inset-0 bg-neutral-focus flex items-center justify-center">
              <UserAvatar name="Tú" size="xl" />
            </div>
          )}
          {/* Nombre */}
          <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
            <span className="text-xs font-medium text-white bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-md">
              Tú {!mic && "(silenciado)"}
            </span>
          </div>
        </div>

        {/* Otros participantes */}
        {participants.map((name) => (
          <div
            key={name}
            className="relative bg-base-300 rounded-xl overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-primary/10 flex items-center justify-center">
              <UserAvatar name={name} size="xl" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </div>

            {/* Audio indicator */}
            <div className="absolute top-2 right-2">
              <div className="flex items-end gap-0.5">
                <div className="w-0.5 h-2 bg-success rounded-full animate-pulse" />
                <div className="w-0.5 h-3 bg-success rounded-full animate-pulse [animation-delay:0.1s]" />
                <div className="w-0.5 h-1.5 bg-success rounded-full animate-pulse [animation-delay:0.2s]" />
              </div>
            </div>

            {/* Nombre */}
            <div className="absolute bottom-2 left-2">
              <span className="text-xs font-medium text-white bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-md">
                {name}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Controles */}
      <div className="bg-neutral/90 backdrop-blur border-t border-white/5">
        <CallControls
          mic={mic}
          camera={camera}
          sharing={sharing}
          onToggleMic={() => setMic(!mic)}
          onToggleCamera={() => setCamera(!camera)}
          onToggleShare={() => setSharing(!sharing)}
          onHangUp={onHangUp}
        />
      </div>
    </div>
  );
}
