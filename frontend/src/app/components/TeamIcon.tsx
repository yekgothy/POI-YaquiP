interface TeamIconProps {
  name: string;
  emoji?: string;
  active?: boolean;
  unread?: number;
  onClick?: () => void;
}

export default function TeamIcon({
  name,
  emoji,
  active = false,
  unread = 0,
  onClick,
}: TeamIconProps) {
  return (
    <div className="tooltip tooltip-right" data-tip={name}>
      <button
        onClick={onClick}
        className={`relative w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold transition-all duration-200 hover:rounded-xl ${
          active
            ? "bg-primary text-primary-content rounded-xl shadow-lg shadow-primary/30"
            : "bg-base-300 text-base-content/70 hover:bg-primary/20 hover:text-primary"
        }`}
      >
        {emoji || name.charAt(0).toUpperCase()}
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 badge badge-error badge-xs text-[10px] font-bold min-w-[18px]">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>
    </div>
  );
}
