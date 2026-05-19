import { useCallback, useEffect, useRef, useState } from "react";
import { Device } from "mediasoup-client";
import { getSocket } from "../lib/socket";

interface ProducerInfo {
  producerId: string;
  peerId: string;
  kind: "audio" | "video";
  userId: string;
  displayName: string;
  avatar: string;
}

interface ConsumerInfo {
  id: string;
  producerId: string;
  kind: "audio" | "video";
  rtpParameters: unknown;
  peerId: string;
  userId: string;
  displayName: string;
  avatar: string;
}

interface RemoteParticipant {
  peerId: string;
  userId: string;
  displayName: string;
  avatar: string;
  stream: MediaStream;
}

interface UseMediasoupCallOptions {
  callId: string;
}

function socketRequest<T>(event: string, payload: unknown): Promise<T> {
  const socket = getSocket();

  if (!socket) {
    return Promise.reject(new Error("Socket not connected"));
  }

  return new Promise((resolve, reject) => {
    socket.emit(event, payload, (response: T & { ok?: boolean; error?: string }) => {
      if (!response || response.ok === false) {
        reject(new Error(response?.error || `Socket request failed: ${event}`));
        return;
      }

      resolve(response);
    });
  });
}

export function useMediasoupCall({ callId }: UseMediasoupCallOptions) {
  const deviceRef = useRef<any>(null);
  const sendTransportRef = useRef<any>(null);
  const recvTransportRef = useRef<any>(null);
  const audioProducerRef = useRef<any>(null);
  const videoProducerRef = useRef<any>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteParticipantsRef = useRef<Map<string, RemoteParticipant>>(new Map());
  const consumersRef = useRef<Map<string, { consumer: any; peerId: string; kind: "audio" | "video" }>>(new Map());
  const joinedRef = useRef(false);
  const leavingRef = useRef(false);

  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteParticipants, setRemoteParticipants] = useState<RemoteParticipant[]>([]);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);

  const syncRemoteParticipants = useCallback(() => {
    setRemoteParticipants(Array.from(remoteParticipantsRef.current.values()));
  }, []);

  const removeProducer = useCallback((producerId: string) => {
    const entry = consumersRef.current.get(producerId);
    if (!entry) return;

    const participant = remoteParticipantsRef.current.get(entry.peerId);
    if (participant) {
      const tracksToRemove = participant.stream.getTracks().filter((track) => track.kind === entry.kind);
      for (const track of tracksToRemove) {
        participant.stream.removeTrack(track);
        track.stop();
      }

      if (participant.stream.getTracks().length === 0) {
        remoteParticipantsRef.current.delete(entry.peerId);
      }
    }

    try {
      entry.consumer.close();
    } catch {
      // Ignore cleanup errors for stale consumers.
    }

    consumersRef.current.delete(producerId);
    syncRemoteParticipants();
  }, [syncRemoteParticipants]);

  const leaveCall = useCallback(async () => {
    if (leavingRef.current) return;
    leavingRef.current = true;

    const socket = getSocket();

    if (socket) {
      socket.off("mediasoup:new-producer");
      socket.off("mediasoup:producer-closed");
    }

    for (const { consumer } of consumersRef.current.values()) {
      try {
        consumer.close();
      } catch {
        // Ignore consumer cleanup errors.
      }
    }
    consumersRef.current.clear();

    if (audioProducerRef.current) {
      audioProducerRef.current.close();
      audioProducerRef.current = null;
    }

    if (videoProducerRef.current) {
      videoProducerRef.current.close();
      videoProducerRef.current = null;
    }

    if (sendTransportRef.current) {
      sendTransportRef.current.close();
      sendTransportRef.current = null;
    }

    if (recvTransportRef.current) {
      recvTransportRef.current.close();
      recvTransportRef.current = null;
    }

    if (localStreamRef.current) {
      for (const track of localStreamRef.current.getTracks()) {
        track.stop();
      }
      localStreamRef.current = null;
    }

    deviceRef.current = null;
    remoteParticipantsRef.current.clear();
    setRemoteParticipants([]);
    setLocalStream(null);
    setIsReady(false);
    joinedRef.current = false;

    if (socket) {
      try {
        await socketRequest("mediasoup:leave-room", { callId });
      } catch {
        // Ignore signaling cleanup errors during teardown.
      }
    }

    leavingRef.current = false;
  }, [callId]);

  const consumeProducer = useCallback(async (producer: ProducerInfo) => {
    if (!deviceRef.current || !recvTransportRef.current || consumersRef.current.has(producer.producerId)) {
      return;
    }

    const response = await socketRequest<{ ok: true; consumer: ConsumerInfo }>("mediasoup:consume", {
      callId,
      transportId: recvTransportRef.current.id,
      producerId: producer.producerId,
      rtpCapabilities: deviceRef.current.rtpCapabilities,
    });

    const consumerInfo = response.consumer;
    const consumer = await recvTransportRef.current.consume({
      id: consumerInfo.id,
      producerId: consumerInfo.producerId,
      kind: consumerInfo.kind,
      rtpParameters: consumerInfo.rtpParameters,
    });

    consumersRef.current.set(consumerInfo.producerId, {
      consumer,
      peerId: consumerInfo.peerId,
      kind: consumerInfo.kind,
    });

    const existingParticipant = remoteParticipantsRef.current.get(consumerInfo.peerId);
    const stream = existingParticipant?.stream || new MediaStream();

    const staleTracks = stream.getTracks().filter((track) => track.kind === consumer.track.kind);
    for (const staleTrack of staleTracks) {
      stream.removeTrack(staleTrack);
      staleTrack.stop();
    }

    stream.addTrack(consumer.track);

    remoteParticipantsRef.current.set(consumerInfo.peerId, {
      peerId: consumerInfo.peerId,
      userId: consumerInfo.userId,
      displayName: consumerInfo.displayName,
      avatar: consumerInfo.avatar,
      stream,
    });

    consumer.on("producerclose", () => {
      removeProducer(consumerInfo.producerId);
    });

    consumer.on("transportclose", () => {
      removeProducer(consumerInfo.producerId);
    });

    await socketRequest("mediasoup:resume-consumer", {
      callId,
      consumerId: consumer.id,
    });

    syncRemoteParticipants();
  }, [callId, removeProducer, syncRemoteParticipants]);

  const joinCurrentCall = useCallback(async () => {
    if (joinedRef.current) return;

    try {
      const socket = getSocket();
      if (!socket) {
        throw new Error("Socket not connected");
      }

      joinedRef.current = true;
      setError(null);

      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasAudioInput = devices.some((device) => device.kind === "audioinput");
      const hasVideoInput = devices.some((device) => device.kind === "videoinput");

      const captureAttempts: Array<{ audio: boolean; video: boolean }> = [];
      if (hasAudioInput || hasVideoInput) {
        captureAttempts.push({ audio: hasAudioInput, video: hasVideoInput });
      }
      if (hasVideoInput) {
        captureAttempts.push({ audio: false, video: true });
      }
      if (hasAudioInput) {
        captureAttempts.push({ audio: true, video: false });
      }

      let mediaStream: MediaStream | null = null;
      let lastMediaError: any = null;
      let captureWarning: string | null = null;

      for (const constraints of captureAttempts) {
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
          break;
        } catch (mediaError: any) {
          lastMediaError = mediaError;

          if (mediaError?.name === "NotAllowedError") {
            throw new Error("Permisos de camara/microfono denegados. Habilitalos y vuelve a intentar");
          }

          const isRetryableError = ["NotFoundError", "NotReadableError", "AbortError", "OverconstrainedError", "TrackStartError"].includes(
            mediaError?.name
          );
          if (!isRetryableError) {
            throw mediaError;
          }
        }
      }

      if (!mediaStream) {
        if (!hasAudioInput && !hasVideoInput) {
          captureWarning = "Entraste en modo solo escucha: no se detecto microfono ni camara";
        } else if (lastMediaError?.name === "NotReadableError") {
          captureWarning = "Entraste en modo solo escucha: no se pudo iniciar el microfono/camara (posible uso por otra app)";
        } else {
          captureWarning = "Entraste en modo solo escucha: no se pudo iniciar camara/microfono";
        }

        mediaStream = new MediaStream();
      }

      if (captureWarning) {
        setError(captureWarning);
      }

      localStreamRef.current = mediaStream;
      setLocalStream(mediaStream);
      setIsCameraOn(mediaStream.getVideoTracks().some((track) => track.enabled));
      setIsMicOn(mediaStream.getAudioTracks().some((track) => track.enabled));

      const roomResponse = await socketRequest<{
        ok: true;
        routerRtpCapabilities: unknown;
        producers: ProducerInfo[];
      }>("mediasoup:join-room", { callId });

      const device = new Device();
      await device.load({ routerRtpCapabilities: roomResponse.routerRtpCapabilities as never });
      deviceRef.current = device;

      const sendTransportResponse = await socketRequest<{
        ok: true;
        transport: {
          id: string;
          iceParameters: unknown;
          iceCandidates: unknown[];
          dtlsParameters: unknown;
          sctpParameters?: unknown;
        };
      }>("mediasoup:create-transport", {
        callId,
        direction: "send",
      });

      const sendTransport = device.createSendTransport(sendTransportResponse.transport);
      sendTransportRef.current = sendTransport;

      sendTransport.on("connect", async ({ dtlsParameters }: { dtlsParameters: unknown }, callback: () => void, errback: (error: Error) => void) => {
        try {
          await socketRequest("mediasoup:connect-transport", {
            callId,
            transportId: sendTransport.id,
            dtlsParameters,
          });
          callback();
        } catch (transportError) {
          errback(transportError as Error);
        }
      });

      sendTransport.on(
        "produce",
        async (
          {
            kind,
            rtpParameters,
            appData,
          }: {
            kind: "audio" | "video";
            rtpParameters: unknown;
            appData: Record<string, unknown>;
          },
          callback: ({ id }: { id: string }) => void,
          errback: (error: Error) => void
        ) => {
          try {
            const response = await socketRequest<{ ok: true; id: string }>("mediasoup:produce", {
              callId,
              transportId: sendTransport.id,
              kind,
              rtpParameters,
              appData,
            });
            callback({ id: response.id });
          } catch (produceError) {
            errback(produceError as Error);
          }
        }
      );

      const recvTransportResponse = await socketRequest<{
        ok: true;
        transport: {
          id: string;
          iceParameters: unknown;
          iceCandidates: unknown[];
          dtlsParameters: unknown;
          sctpParameters?: unknown;
        };
      }>("mediasoup:create-transport", {
        callId,
        direction: "recv",
      });

      const recvTransport = device.createRecvTransport(recvTransportResponse.transport);
      recvTransportRef.current = recvTransport;

      recvTransport.on("connect", async ({ dtlsParameters }: { dtlsParameters: unknown }, callback: () => void, errback: (error: Error) => void) => {
        try {
          await socketRequest("mediasoup:connect-transport", {
            callId,
            transportId: recvTransport.id,
            dtlsParameters,
          });
          callback();
        } catch (transportError) {
          errback(transportError as Error);
        }
      });

      const audioTrack = mediaStream.getAudioTracks()[0];
      if (audioTrack) {
        audioProducerRef.current = await sendTransport.produce({
          track: audioTrack,
          appData: { mediaTag: "microphone" },
        });
      }

      const videoTrack = mediaStream.getVideoTracks()[0];
      if (videoTrack) {
        videoProducerRef.current = await sendTransport.produce({
          track: videoTrack,
          appData: { mediaTag: "camera" },
        });
      }

      socket.on("mediasoup:new-producer", consumeProducer);
      socket.on("mediasoup:producer-closed", ({ producerId }: { producerId: string }) => {
        removeProducer(producerId);
      });

      for (const producer of roomResponse.producers) {
        await consumeProducer(producer);
      }

      setIsReady(true);
    } catch (joinError) {
      console.error("Failed to initialize mediasoup call:", joinError);
      setError(joinError instanceof Error ? joinError.message : "Failed to initialize call");
      joinedRef.current = false;
    }
  }, [callId, consumeProducer, removeProducer]);

  useEffect(() => {
    void joinCurrentCall();

    return () => {
      void leaveCall();
    };
  }, [joinCurrentCall, leaveCall]);

  const toggleMic = useCallback(async () => {
    const audioTrack = localStreamRef.current?.getAudioTracks()[0];
    const producer = audioProducerRef.current;
    if (!audioTrack || !producer) return;

    if (isMicOn) {
      await producer.pause();
      audioTrack.enabled = false;
      setIsMicOn(false);
    } else {
      audioTrack.enabled = true;
      await producer.resume();
      setIsMicOn(true);
    }
  }, [isMicOn]);

  const toggleCamera = useCallback(async () => {
    const videoTrack = localStreamRef.current?.getVideoTracks()[0];
    const producer = videoProducerRef.current;
    if (!videoTrack || !producer) return;

    if (isCameraOn) {
      await producer.pause();
      videoTrack.enabled = false;
      setIsCameraOn(false);
    } else {
      videoTrack.enabled = true;
      await producer.resume();
      setIsCameraOn(true);
    }
  }, [isCameraOn]);

  return {
    isReady,
    error,
    localStream,
    remoteParticipants,
    isCameraOn,
    isMicOn,
    toggleMic,
    toggleCamera,
    leaveCall,
  };
}