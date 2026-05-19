import UserAvatar from "./UserAvatar";

import { useCall } from "../../context/CallContext";

export function CallInvitation() {
  const { incomingCall, acceptCall, rejectCall } = useCall();

  if (!incomingCall) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-neutral rounded-lg p-8 max-w-sm w-full mx-4 animate-in fade-in zoom-in-95">
        <div className="flex flex-col items-center gap-4">
          {/* Avatar */}
          <UserAvatar
            src={incomingCall.callerAvatar}
            name={incomingCall.callerName}
            size="lg"
            className="ring-4 ring-primary/20"
          />

          {/* Call Info */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-neutral-content">
              {incomingCall.callerName}
            </h3>
            <p className="text-neutral-content/60 mt-1">
              {incomingCall.callType === "direct" ? "Llamada de video" : "Llamada grupal"}
            </p>
          </div>

          {/* Incoming call animation */}
          <div className="flex gap-1 items-center justify-center">
            <div className="w-2 h-2 bg-error rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-error rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
            <div className="w-2 h-2 bg-error rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 w-full mt-4">
            <button
              onClick={rejectCall}
              className="flex-1 btn btn-ghost btn-lg rounded-full text-error hover:bg-error/10 hover:text-error"
              title="Rechazar llamada"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </button>
            <button
              onClick={acceptCall}
              className="flex-1 btn btn-success btn-lg rounded-full text-white hover:bg-success/90"
              title="Aceptar llamada"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
