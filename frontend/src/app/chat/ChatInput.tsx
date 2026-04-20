import { useState, useRef } from "react";

interface ChatInputProps {
  channelName: string;
  onSend?: (message: string) => void;
  onTyping?: () => void;
  typingUsers?: string[];
}

export default function ChatInput({ channelName, onSend, onTyping, typingUsers = [] }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSend?.(message.trim());
      setMessage("");
    }
  };

  const handleChange = (val: string) => {
    setMessage(val);
    // Throttle typing events
    if (!typingTimer.current) {
      onTyping?.();
      typingTimer.current = setTimeout(() => {
        typingTimer.current = null;
      }, 2000);
    }
  };

  return (
    <div className="px-4 pb-4 pt-2 shrink-0">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-end gap-2 bg-base-200 rounded-xl border border-base-300 focus-within:border-primary/50 focus-within:shadow-sm focus-within:shadow-primary/10 transition-all">
          {/* Botón adjuntar */}
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-circle ml-1 mb-1 text-base-content/40 hover:text-primary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
            </svg>
          </button>

          {/* Input */}
          <textarea
            value={message}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder={`Escribe en #${channelName}...`}
            rows={1}
            className="flex-1 bg-transparent py-3 px-1 text-sm resize-none outline-none max-h-32 placeholder:text-base-content/30"
          />

          {/* Acciones derecha */}
          <div className="flex items-center gap-0.5 mr-1 mb-1">
            <button type="button" className="btn btn-ghost btn-sm btn-circle text-base-content/40 hover:text-warning">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
              </svg>
            </button>
            <button type="button" className="btn btn-ghost btn-sm btn-circle text-base-content/40 hover:text-info">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
              </svg>
            </button>

            {/* Enviar */}
            <button
              type="submit"
              disabled={!message.trim()}
              className="btn btn-primary btn-sm btn-circle disabled:opacity-30 transition-opacity"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
              </svg>
            </button>
          </div>
        </div>
      </form>

      {/* Indicador escribiendo */}
      <div className="h-5 flex items-center px-2">
        {typingUsers.length > 0 && (
          <p className="text-[11px] text-base-content/30 animate-pulse">
            {typingUsers.length === 1
              ? `${typingUsers[0]} está escribiendo...`
              : `${typingUsers.join(", ")} están escribiendo...`}
          </p>
        )}
      </div>
    </div>
  );
}
