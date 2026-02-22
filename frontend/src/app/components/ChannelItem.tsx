interface ChannelItemProps {
  name: string;
  type?: "text" | "voice" | "video";
  active?: boolean;
  unread?: number;
  onClick?: () => void;
}

const typeIcons = {
  text: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.9 19.5m-2.1-19.5-3.9 19.5" />
    </svg>
  ),
  voice: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
    </svg>
  ),
  video: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  ),
};

export default function ChannelItem({
  name,
  type = "text",
  active = false,
  unread = 0,
  onClick,
}: ChannelItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-all duration-150 group ${
        active
          ? "bg-primary/15 text-primary font-semibold"
          : "text-base-content/60 hover:bg-base-300/50 hover:text-base-content"
      }`}
    >
      <span className={active ? "text-primary" : "text-base-content/40 group-hover:text-base-content/60"}>
        {typeIcons[type]}
      </span>
      <span className="truncate flex-1 text-left">{name}</span>
      {unread > 0 && (
        <span className="badge badge-primary badge-xs min-w-[18px]">{unread}</span>
      )}
    </button>
  );
}
