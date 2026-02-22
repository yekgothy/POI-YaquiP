interface CallControlsProps {
  mic?: boolean;
  camera?: boolean;
  sharing?: boolean;
  onToggleMic?: () => void;
  onToggleCamera?: () => void;
  onToggleShare?: () => void;
  onHangUp?: () => void;
  showCamera?: boolean;
  showShare?: boolean;
}

export default function CallControls({
  mic = true,
  camera = true,
  sharing = false,
  onToggleMic,
  onToggleCamera,
  onToggleShare,
  onHangUp,
  showCamera = true,
  showShare = true,
}: CallControlsProps) {
  return (
    <div className="flex items-center justify-center gap-3 py-4">
      {/* Micrófono */}
      <button
        onClick={onToggleMic}
        className={`btn btn-circle btn-lg transition-all duration-200 ${
          mic
            ? "bg-base-300/80 hover:bg-base-300 text-base-content"
            : "bg-error/20 text-error hover:bg-error/30"
        }`}
      >
        {mic ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m3 3 18 18M12 18.75a6 6 0 0 0 5.926-5.066M12 18.75a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5" />
          </svg>
        )}
      </button>

      {/* Cámara */}
      {showCamera && (
        <button
          onClick={onToggleCamera}
          className={`btn btn-circle btn-lg transition-all duration-200 ${
            camera
              ? "bg-base-300/80 hover:bg-base-300 text-base-content"
              : "bg-error/20 text-error hover:bg-error/30"
          }`}
        >
          {camera ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M12 18.75H4.5a2.25 2.25 0 0 1-2.25-2.25V9m12.841 9.091L16.5 19.5m-1.409-.409-7.5-7.5m0 0L3 7.5" />
            </svg>
          )}
        </button>
      )}

      {/* Compartir pantalla */}
      {showShare && (
        <button
          onClick={onToggleShare}
          className={`btn btn-circle btn-lg transition-all duration-200 ${
            sharing
              ? "bg-success/20 text-success hover:bg-success/30"
              : "bg-base-300/80 hover:bg-base-300 text-base-content"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25A2.25 2.25 0 0 1 5.25 3h13.5A2.25 2.25 0 0 1 21 5.25Z" />
          </svg>
        </button>
      )}

      {/* Colgar */}
      <button
        onClick={onHangUp}
        className="btn btn-circle btn-lg bg-error text-error-content hover:bg-error/80 shadow-lg shadow-error/30 transition-all duration-200 hover:scale-105"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 3.75 18 6m0 0 2.25 2.25M18 6l2.25-2.25M18 6l-2.25 2.25m1.5 13.5c-8.284 0-15-6.716-15-15v-2.25A2.25 2.25 0 0 1 4.5 2.25h1.372c.516 0 .966.351 1.091.852l1.106 4.423c.11.44-.054.902-.417 1.173l-1.293.97a1.062 1.062 0 0 0-.38 1.21 12.035 12.035 0 0 0 7.143 7.143c.441.162.928-.004 1.21-.38l.97-1.293a1.125 1.125 0 0 1 1.173-.417l4.423 1.106c.5.125.852.575.852 1.091V19.5a2.25 2.25 0 0 1-2.25 2.25h-2.25Z" />
        </svg>
      </button>
    </div>
  );
}
