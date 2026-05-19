import { useEffect, useRef, useState } from "react";
import ChatBubble from "./ChatBubble";
import ChatInput from "./ChatInput";
import { useChat } from "../../hooks/useChat";
import { useAuth } from "../../context/AuthContext";
import { useCall } from "../../context/CallContext";
import { startCall } from "../../lib/callsApi";
import { DailyCall } from "../calls/DailyCall";

interface ChatViewProps {
  channelName: string;
  channelId?: string;
  isDM?: boolean;
  targetUserId?: string;
}

export default function ChatView({ channelName, channelId, isDM = false, targetUserId }: ChatViewProps) {
  const { user } = useAuth();
  const { messages, loading, sendError, uploading, typingUsers, sendMessage, uploadAndSendFile, sendTyping } = useChat(
    channelId || null
  );
  const { activeCall, initiateCall, startCall: startCallContext } = useCall();
  const [isStartingCall, setIsStartingCall] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleStartCall = async () => {
    try {
      setIsStartingCall(true);
      const callType = isDM ? "direct" : "group";
      const response = await startCall(channelId, callType);

      await startCallContext({
        id: response.callId,
        roomName: response.roomName,
        callType,
        channelId,
      });

      await initiateCall({
        callId: response.callId,
        roomName: response.roomName,
        channelId,
        targetUserId,
        callType,
      });
    } catch (error) {
      console.error("Error starting call:", error);
      alert("Error al iniciar la llamada");
    } finally {
      setIsStartingCall(false);
    }
  };

  // Show active call view
  if (activeCall) {
    return (
      <DailyCall
        callId={activeCall.id}
        roomName={activeCall.roomName}
      />
    );
  }

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
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-base-content">
                {isDM ? channelName : `#${channelName}`}
              </h2>
              <p className="text-sm text-base-content/50 mt-1">
                {isDM
                  ? `Este es el inicio de tu conversación con ${channelName}.`
                  : `¡Bienvenido a #${channelName}! Este es el inicio del canal.`}
              </p>
            </div>
            <button
              onClick={handleStartCall}
              disabled={isStartingCall}
              className="btn btn-primary btn-sm gap-2 ml-4"
              title={isDM ? "Iniciar videollamada" : "Iniciar videollamada grupal"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M15.5 1h-8C6.12 1 5 2.12 5 3.5v17C5 21.88 6.12 23 7.5 23h8c1.38 0 2.5-1.12 2.5-2.5v-17C18 2.12 16.88 1 15.5 1zm-4 21c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm4.5-4H7V4h9v14z" />
              </svg>
              {isStartingCall ? "Iniciando..." : "Llamada"}
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-8">
            <span className="loading loading-dots loading-md text-primary" />
          </div>
        )}

        {/* Fecha separador */}
        {messages.length > 0 && (
          <div className="flex items-center gap-3 px-4 my-4">
            <div className="flex-1 h-px bg-base-300" />
            <span className="text-xs font-medium text-base-content/30 bg-base-100 px-2">
              Hoy
            </span>
            <div className="flex-1 h-px bg-base-300" />
          </div>
        )}

        {/* Mensajes reales */}
        <div className="space-y-0.5 pb-2">
          {messages.map((msg, i) => {
            const isOwn = msg.sender._id === user?._id;
            const prevMsg = messages[i - 1];
            const showSender = !prevMsg || prevMsg.sender._id !== msg.sender._id;
            const time = new Date(msg.createdAt).toLocaleTimeString("es-MX", {
              hour: "2-digit",
              minute: "2-digit",
            });
            return (
              <ChatBubble
                key={msg._id}
                sender={isOwn ? "Tú" : msg.sender.displayName}
                avatar={msg.sender.avatar}
                content={msg.content}
                type={msg.type}
                attachment={msg.attachment || null}
                time={time}
                isOwn={isOwn}
                showSender={showSender}
              />
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      {sendError && (
        <div className="px-4 pb-2">
          <div className="alert alert-error py-2 min-h-0 text-sm">
            <span>{sendError}</span>
          </div>
        </div>
      )}
      <ChatInput
        channelName={channelName}
        onSend={sendMessage}
        onUploadFile={uploadAndSendFile}
        uploading={uploading}
        onTyping={sendTyping}
        typingUsers={typingUsers}
      />
    </div>
  );
}
