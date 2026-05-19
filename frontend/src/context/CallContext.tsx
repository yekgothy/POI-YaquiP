import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getSocket } from "../lib/socket";
import { endCall as endCallRequest, joinCall } from "../lib/callsApi";

export interface Call {
  id: string;
  roomName: string;
  callerId?: string;
  callerName?: string;
  callerAvatar?: string;
  callType: "direct" | "group";
  status: "incoming" | "active" | "ended";
  channelId?: string;
}

interface CallContextType {
  activeCall: Call | null;
  incomingCall: Call | null;
  initiateCall: (details: {
    callId: string;
    roomName: string;
    channelId?: string;
    targetUserId?: string;
    callType?: "direct" | "group";
  }) => Promise<void>;
  acceptCall: () => Promise<void>;
  rejectCall: () => Promise<void>;
  endCall: () => Promise<void>;
  leaveActiveCall: () => void;
  startCall: (call: {
    id: string;
    roomName: string;
    callType?: "direct" | "group";
    channelId?: string;
  }) => Promise<void>;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export function CallProvider({ children }: { children: React.ReactNode }) {
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [incomingCall, setIncomingCall] = useState<Call | null>(null);
  const socket = getSocket();

  // Listen for socket events
  useEffect(() => {
    if (!socket) return;

    socket.on("call:incoming", (data) => {
      setIncomingCall({
        id: data.callId || `call-${Date.now()}`,
        roomName: data.roomName || "",
        callerId: data.callerId,
        callerName: data.callerName,
        callerAvatar: data.callerAvatar,
        callType: data.callType || "direct",
        status: "incoming",
        channelId: data.channelId,
      });
    });

    socket.on("call:accepted", ({ callId }) => {
      setIncomingCall((prev) => (prev?.id === callId ? null : prev));
    });

    socket.on("call:rejected", ({ callId }) => {
      setIncomingCall((prev) => (prev?.id === callId ? null : prev));
    });

    socket.on("call:ended", ({ callId }) => {
      setActiveCall((prev) => (prev?.id === callId ? null : prev));
      setIncomingCall((prev) => (prev?.id === callId ? null : prev));
    });

    return () => {
      socket.off("call:incoming");
      socket.off("call:accepted");
      socket.off("call:rejected");
      socket.off("call:ended");
    };
  }, [socket]);

  const initiateCall = useCallback(
    async ({ callId, roomName, channelId, targetUserId, callType = "direct" }: {
      callId: string;
      roomName: string;
      channelId?: string;
      targetUserId?: string;
      callType?: "direct" | "group";
    }) => {
      if (!socket) return;
      socket.emit("call:initiate", {
        callId,
        roomName,
        targetUserId,
        channelId,
        callType,
      });
    },
    [socket]
  );

  const acceptCall = useCallback(async () => {
    if (!socket || !incomingCall) return;

    const response = await joinCall(incomingCall.id);

    socket.emit("call:accept", {
      callId: incomingCall.id,
      roomName: incomingCall.roomName,
    });
    setActiveCall({
      ...incomingCall,
      roomName: response.roomName,
      callType: response.callType,
      status: "active",
    });
    setIncomingCall(null);
  }, [socket, incomingCall]);

  const rejectCall = useCallback(async () => {
    if (!socket || !incomingCall) return;
    socket.emit("call:reject", { callId: incomingCall.id });
    setIncomingCall(null);
  }, [socket, incomingCall]);

  const endCall = useCallback(async () => {
    if (!activeCall) return;

    await endCallRequest(activeCall.id);

    if (socket) {
      socket.emit("call:ended", { callId: activeCall.id });
    }
    setActiveCall(null);
  }, [socket, activeCall]);

  const leaveActiveCall = useCallback(() => {
    setActiveCall(null);
  }, []);

  const startCall = useCallback(
    async ({ id, roomName, callType = "group", channelId }: {
      id: string;
      roomName: string;
      callType?: "direct" | "group";
      channelId?: string;
    }) => {
      const call: Call = {
        id,
        roomName,
        callType,
        status: "active",
        channelId,
      };
      setActiveCall(call);
    },
    []
  );

  return (
    <CallContext.Provider
      value={{
        activeCall,
        incomingCall,
        initiateCall,
        acceptCall,
        rejectCall,
        endCall,
        leaveActiveCall,
        startCall,
      }}
    >
      {children}
    </CallContext.Provider>
  );
}

export function useCall() {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error("useCall must be used within CallProvider");
  }
  return context;
}
