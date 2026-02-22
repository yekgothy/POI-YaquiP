import MemberItem from "../components/MemberItem";

interface MemberPanelProps {
  visible: boolean;
}

const members = {
  online: [
    { name: "Carlos Vela", role: "Capitán", online: true },
    { name: "Ana Torres", role: "Mediocampista", online: true },
    { name: "Lucía Méndez", role: "Delantera", online: true },
    { name: "Pedro Ramírez", role: "Portero", online: true },
  ],
  offline: [
    { name: "Miguel Herrera", role: "Director técnico", online: false },
    { name: "Roberto Díaz", role: "Defensa", online: false },
    { name: "Sandra López", role: "Mediocampista", online: false },
  ],
};

export default function MemberPanel({ visible }: MemberPanelProps) {
  if (!visible) return null;

  return (
    <div className="w-60 bg-base-200 border-l border-base-300 flex flex-col shrink-0">
      <div className="p-3 border-b border-base-300">
        <h4 className="font-bold text-sm text-base-content">Miembros</h4>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        {/* En línea */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-base-content/40 px-2 mb-1">
            En línea — {members.online.length}
          </p>
          {members.online.map((m) => (
            <MemberItem key={m.name} {...m} />
          ))}
        </div>

        {/* Desconectados */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-base-content/40 px-2 mb-1">
            Desconectados — {members.offline.length}
          </p>
          {members.offline.map((m) => (
            <MemberItem key={m.name} {...m} />
          ))}
        </div>
      </div>
    </div>
  );
}
