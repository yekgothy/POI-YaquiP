import ChatBubble from "./ChatBubble";
import ChatInput from "./ChatInput";

interface ChatViewProps {
  channelName: string;
  isDM?: boolean;
}

const mockMessages = [
  {
    sender: "Carlos Vela",
    content: "¡Buenas tardes equipo! ¿Ya vieron la convocatoria para el partido del viernes? 🏟️",
    time: "2:30 PM",
    isOwn: false,
    showSender: true,
  },
  {
    sender: "Ana Torres",
    content: "Sí, me parece excelente. Creo que tenemos buen equipo para este reto.",
    time: "2:32 PM",
    isOwn: false,
    showSender: true,
  },
  {
    sender: "Ana Torres",
    content: "Les comparto el documento con la estrategia que preparé 📋",
    time: "2:32 PM",
    isOwn: false,
    showSender: false,
  },
  {
    sender: "Tú",
    content: "¡Perfecto! Lo revisaré en un momento. También quería proponer que hagamos una reunión corta antes del partido.",
    time: "2:35 PM",
    isOwn: true,
    showSender: true,
  },
  {
    sender: "Lucía Méndez",
    content: "De acuerdo, ¿a qué hora les funciona? Yo estoy libre después de las 5 ⚽",
    time: "2:38 PM",
    isOwn: false,
    showSender: true,
  },
  {
    sender: "Carlos Vela",
    content: "Las 5:30 me parece bien. Yo creo que deberíamos descansar la delantera y reforzar el medio.",
    time: "2:40 PM",
    isOwn: false,
    showSender: true,
  },
  {
    sender: "Carlos Vela",
    content: "¿Qué opinan? @Ana Torres tu que dices como mediocampista",
    time: "2:40 PM",
    isOwn: false,
    showSender: false,
  },
  {
    sender: "Tú",
    content: "Concuerdo con Carlos, agendemos a las 5:30 entonces 👍",
    time: "2:42 PM",
    isOwn: true,
    showSender: true,
  },
  {
    sender: "Pedro Ramírez",
    content: "¡Listo! Ahí estaré. Por cierto, ¿alguien completó las tareas de la semana? Vi que hay recompensas nuevas 🏆",
    time: "2:45 PM",
    isOwn: false,
    showSender: true,
  },
];

export default function ChatView({ channelName, isDM = false }: ChatViewProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto">
        {/* Bienvenida al canal */}
        <div className="px-4 pt-8 pb-4 border-b border-base-300 mb-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            {isDM ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.9 19.5m-2.1-19.5-3.9 19.5" />
              </svg>
            )}
          </div>
          <h2 className="text-2xl font-bold text-base-content">
            {isDM ? channelName : `#${channelName}`}
          </h2>
          <p className="text-sm text-base-content/50 mt-1">
            {isDM
              ? `Este es el inicio de tu conversación con ${channelName}.`
              : `¡Bienvenido a #${channelName}! Este es el inicio del canal.`}
          </p>
        </div>

        {/* Fecha separador */}
        <div className="flex items-center gap-3 px-4 my-4">
          <div className="flex-1 h-px bg-base-300" />
          <span className="text-xs font-medium text-base-content/30 bg-base-100 px-2">
            Hoy
          </span>
          <div className="flex-1 h-px bg-base-300" />
        </div>

        {/* Mensajes */}
        <div className="space-y-0.5 pb-2">
          {mockMessages.map((msg, i) => (
            <ChatBubble key={i} {...msg} />
          ))}
        </div>
      </div>

      {/* Input */}
      <ChatInput channelName={channelName} />
    </div>
  );
}
