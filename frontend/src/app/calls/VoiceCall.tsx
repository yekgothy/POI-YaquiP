import { useState } from "react";
import UserAvatar from "../components/UserAvatar";
import CallControls from "./CallControls";

interface VoiceCallProps {
  callerName: string;
  onHangUp: () => void;
}

export default function VoiceCall({ callerName, onHangUp }: VoiceCallProps) {
  const [mic, setMic] = useState(true);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-base-300 to-base-200">
      {/* Info del contacto */}
      <div className="flex flex-col items-center gap-4 mb-12 animate-[fadeInUp_0.5s_ease-out]">
        <div className="relative">
          {/* Anillos de audio animados */}
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
          <div className="absolute -inset-3 rounded-full bg-primary/5 animate-pulse" />
          <UserAvatar name={callerName} size="xl" />
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-base-content">{callerName}</h2>
          <p className="text-sm text-success flex items-center gap-1.5 justify-center mt-1">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            Llamada en curso — 05:23
          </p>
        </div>
      </div>

      {/* Controles */}
      <CallControls
        mic={mic}
        onToggleMic={() => setMic(!mic)}
        onHangUp={onHangUp}
        showCamera={false}
        showShare={false}
      />
    </div>
  );
}
