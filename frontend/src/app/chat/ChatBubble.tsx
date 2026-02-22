import UserAvatar from "../components/UserAvatar";

interface ChatBubbleProps {
  sender: string;
  avatar?: string;
  content: string;
  time: string;
  isOwn?: boolean;
  showSender?: boolean;
}

export default function ChatBubble({
  sender,
  avatar,
  content,
  time,
  isOwn = false,
  showSender = true,
}: ChatBubbleProps) {
  return (
    <div className={`flex gap-3 px-4 py-1 group hover:bg-base-200/50 transition-colors ${isOwn ? "" : ""}`}>
      {/* Avatar (solo si muestra sender) */}
      <div className="w-10 shrink-0">
        {showSender && (
          <UserAvatar name={sender} src={avatar} size="md" />
        )}
      </div>

      {/* Contenido */}
      <div className="flex-1 min-w-0">
        {showSender && (
          <div className="flex items-baseline gap-2 mb-0.5">
            <span className={`text-sm font-semibold ${isOwn ? "text-primary" : "text-base-content"}`}>
              {sender}
            </span>
            <span className="text-[10px] text-base-content/30">{time}</span>
          </div>
        )}
        <p className={`text-sm text-base-content/80 leading-relaxed ${!showSender ? "pl-0" : ""}`}>
          {content}
        </p>
      </div>

      {/* Acciones hover */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-start gap-0.5 pt-1 shrink-0">
        <button className="btn btn-ghost btn-xs btn-circle">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
          </svg>
        </button>
        <button className="btn btn-ghost btn-xs btn-circle">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
