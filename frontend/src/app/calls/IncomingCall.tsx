import UserAvatar from "../components/UserAvatar";

interface IncomingCallProps {
  callerName: string;
  callType: "voice" | "video";
  onAccept: () => void;
  onDecline: () => void;
}

export default function IncomingCall({
  callerName,
  callType,
  onAccept,
  onDecline,
}: IncomingCallProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-[fadeInUp_0.3s_ease-out]">
      <div className="card bg-base-100 shadow-2xl w-80">
        <div className="card-body items-center text-center gap-4">
          {/* Animación de ring */}
          <div className="relative">
            <div className="absolute inset-0 rounded-full border-4 border-success/30 animate-ping" />
            <div className="absolute -inset-2 rounded-full border-2 border-success/10 animate-pulse" />
            <UserAvatar name={callerName} size="xl" />
          </div>

          <div>
            <h3 className="text-lg font-bold">{callerName}</h3>
            <p className="text-sm text-base-content/50">
              {callType === "video" ? "Videollamada entrante..." : "Llamada entrante..."}
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-6 mt-2">
            {/* Rechazar */}
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={onDecline}
                className="btn btn-circle btn-lg bg-error text-error-content hover:bg-error/80 shadow-lg shadow-error/30 transition-all hover:scale-105"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 3.75 18 6m0 0 2.25 2.25M18 6l2.25-2.25M18 6l-2.25 2.25m1.5 13.5c-8.284 0-15-6.716-15-15v-2.25A2.25 2.25 0 0 1 4.5 2.25h1.372c.516 0 .966.351 1.091.852l1.106 4.423c.11.44-.054.902-.417 1.173l-1.293.97a1.062 1.062 0 0 0-.38 1.21 12.035 12.035 0 0 0 7.143 7.143c.441.162.928-.004 1.21-.38l.97-1.293a1.125 1.125 0 0 1 1.173-.417l4.423 1.106c.5.125.852.575.852 1.091V19.5a2.25 2.25 0 0 1-2.25 2.25h-2.25Z" />
                </svg>
              </button>
              <span className="text-xs text-base-content/50">Rechazar</span>
            </div>

            {/* Aceptar */}
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={onAccept}
                className="btn btn-circle btn-lg bg-success text-success-content hover:bg-success/80 shadow-lg shadow-success/30 transition-all hover:scale-105"
              >
                {callType === "video" ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                  </svg>
                )}
              </button>
              <span className="text-xs text-base-content/50">Aceptar</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
