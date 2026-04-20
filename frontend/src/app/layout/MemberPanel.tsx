import MemberItem from "../components/MemberItem";
import { useOnlineUsers } from "../../hooks/useOnlineUsers";

interface MemberPanelProps {
  visible: boolean;
}

export default function MemberPanel({ visible }: MemberPanelProps) {
  const { onlineUsers, offlineUsers, loading } = useOnlineUsers();

  if (!visible) return null;

  return (
    <div className="w-60 bg-base-200 border-l border-base-300 flex flex-col shrink-0">
      <div className="p-3 border-b border-base-300">
        <h4 className="font-bold text-sm text-base-content">Miembros</h4>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        {loading ? (
          <div className="flex justify-center py-8">
            <span className="loading loading-dots loading-sm text-primary" />
          </div>
        ) : (
          <>
            {/* En línea */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-base-content/40 px-2 mb-1">
                En línea — {onlineUsers.length}
              </p>
              {onlineUsers.map((u) => (
                <MemberItem
                  key={u._id}
                  name={u.displayName}
                  avatar={u.avatar}
                  online={true}
                />
              ))}
              {onlineUsers.length === 0 && (
                <p className="text-xs text-base-content/30 px-2">Nadie en línea</p>
              )}
            </div>

            {/* Desconectados */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-base-content/40 px-2 mb-1">
                Desconectados — {offlineUsers.length}
              </p>
              {offlineUsers.map((u) => (
                <MemberItem
                  key={u._id}
                  name={u.displayName}
                  avatar={u.avatar}
                  online={false}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
