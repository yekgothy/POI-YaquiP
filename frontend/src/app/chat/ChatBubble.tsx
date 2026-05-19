import UserAvatar from "../components/UserAvatar";

interface ChatBubbleProps {
  sender: string;
  avatar?: string;
  content: string;
  type?: string;
  attachment?: {
    url: string;
    path: string;
    name: string;
    size: number;
    mimeType: string;
  } | null;
  time: string;
  isOwn?: boolean;
  showSender?: boolean;
}

function extractFirstUrl(text: string) {
  const match = String(text || "").match(/https?:\/\/[^\s]+/i);
  return match ? match[0] : "";
}

function isImageUrl(url: string) {
  return /\.(png|jpe?g|webp|gif|bmp|svg)(\?.*)?$/i.test(url);
}

export default function ChatBubble({
  sender,
  avatar,
  content,
  type = "text",
  attachment = null,
  time,
  isOwn = false,
  showSender = true,
}: ChatBubbleProps) {
  const showText = content && content.trim().length > 0;
  const fallbackUrl = !attachment ? extractFirstUrl(content) : "";
  const fallbackIsImage = !!fallbackUrl && isImageUrl(fallbackUrl);

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
        {attachment && type === "image" && (
          <a href={attachment.url} target="_blank" rel="noreferrer" className="block max-w-md mt-1">
            <img
              src={attachment.url}
              alt={attachment.name}
              className="rounded-xl border border-base-300 w-full object-cover max-h-80"
            />
          </a>
        )}

        {!attachment && type === "image" && fallbackUrl && (
          <a href={fallbackUrl} target="_blank" rel="noreferrer" className="block max-w-md mt-1">
            {fallbackIsImage ? (
              <img
                src={fallbackUrl}
                alt="imagen"
                className="rounded-xl border border-base-300 w-full object-cover max-h-80"
              />
            ) : (
              <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-base-200 hover:bg-base-300 transition-colors">
                <span>📎</span>
                <span className="text-sm font-medium">Abrir archivo</span>
              </span>
            )}
          </a>
        )}

        {attachment && type === "video" && (
          <video
            controls
            className="rounded-xl border border-base-300 w-full max-w-md mt-1 max-h-80"
            src={attachment.url}
          />
        )}

        {attachment && type === "audio" && (
          <audio controls className="mt-1 w-full max-w-md">
            <source src={attachment.url} type={attachment.mimeType} />
          </audio>
        )}

        {attachment && type === "file" && (
          <a
            href={attachment.url}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-base-200 hover:bg-base-300 transition-colors"
          >
            <span>📎</span>
            <span className="text-sm font-medium">{attachment.name}</span>
          </a>
        )}

        {showText && (
          <p className={`text-sm text-base-content/80 leading-relaxed ${!showSender ? "pl-0" : ""}`}>
            {content}
          </p>
        )}
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
