import { getToken, API_URL } from "./api";

export interface CallResponse {
  ok: boolean;
  callId: string;
  roomName: string;
  callType: "direct" | "group";
  user: {
    id: string;
    displayName: string;
    avatar: string;
  };
}

export interface JoinCallResponse {
  ok: boolean;
  callId: string;
  roomName: string;
  callType: "direct" | "group";
  user: {
    id: string;
    displayName: string;
    avatar: string;
  };
}

export interface EndCallResponse {
  ok: boolean;
  durationSeconds: number;
}

export async function startCall(
  channelId?: string,
  callType: "direct" | "group" = "group"
): Promise<CallResponse> {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`${API_URL}/calls/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      channelId,
      callType,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to start call");
  }

  return response.json();
}

export async function joinCall(
  callId: string
): Promise<JoinCallResponse> {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`${API_URL}/calls/join`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      callId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to join call");
  }

  return response.json();
}

export async function endCall(callId: string): Promise<EndCallResponse> {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`${API_URL}/calls/end`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      callId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to end call");
  }

  return response.json();
}

export async function getCallHistory(
  limit: number = 20,
  offset: number = 0
): Promise<any[]> {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(
    `${API_URL}/calls/history?limit=${limit}&offset=${offset}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch call history");
  }

  const data = await response.json();
  return data.calls || [];
}

export async function getCall(callId: string): Promise<any> {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`${API_URL}/calls/${callId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch call");
  }

  return response.json();
}
