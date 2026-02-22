import UserAvatar from "./UserAvatar";

interface MemberItemProps {
  name: string;
  avatar?: string;
  role?: string;
  online?: boolean;
  onClick?: () => void;
}

export default function MemberItem({
  name,
  avatar,
  role,
  online = false,
  onClick,
}: MemberItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-base-300/50 transition-colors group"
    >
      <UserAvatar name={name} src={avatar} size="sm" online={online} />
      <div className="flex-1 min-w-0 text-left">
        <p className="text-sm font-medium truncate text-base-content group-hover:text-primary transition-colors">
          {name}
        </p>
        {role && (
          <p className="text-xs text-base-content/40 truncate">{role}</p>
        )}
      </div>
    </button>
  );
}
