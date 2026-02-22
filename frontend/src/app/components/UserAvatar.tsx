interface UserAvatarProps {
  name: string;
  src?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  online?: boolean;
  className?: string;
}

const sizeMap = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-lg",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const bgColors = [
  "bg-primary",
  "bg-secondary",
  "bg-accent",
  "bg-info",
  "bg-success",
  "bg-warning",
  "bg-error",
];

function hashColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return bgColors[Math.abs(hash) % bgColors.length];
}

export default function UserAvatar({
  name,
  src,
  size = "md",
  online,
  className = "",
}: UserAvatarProps) {
  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${sizeMap[size]} rounded-full object-cover ring-2 ring-base-100`}
        />
      ) : (
        <div
          className={`${sizeMap[size]} ${hashColor(name)} rounded-full flex items-center justify-center font-bold text-white ring-2 ring-base-100`}
        >
          {getInitials(name)}
        </div>
      )}
      {online !== undefined && (
        <span
          className={`absolute bottom-0 right-0 block w-3 h-3 rounded-full ring-2 ring-base-100 ${
            online ? "bg-success" : "bg-base-300"
          }`}
        />
      )}
    </div>
  );
}
