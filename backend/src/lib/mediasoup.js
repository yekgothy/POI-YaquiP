const mediasoup = require("mediasoup");

const mediaCodecs = [
  {
    kind: "audio",
    mimeType: "audio/opus",
    clockRate: 48000,
    channels: 2,
  },
  {
    kind: "video",
    mimeType: "video/VP8",
    clockRate: 90000,
    parameters: {
      "x-google-start-bitrate": 1000,
    },
  },
];

const rooms = new Map();
let workerPromise = null;

async function getWorker() {
  if (!workerPromise) {
    workerPromise = mediasoup.createWorker({
      logLevel: process.env.MEDIASOUP_LOG_LEVEL || "warn",
      rtcMinPort: Number(process.env.MEDIASOUP_MIN_PORT || 40000),
      rtcMaxPort: Number(process.env.MEDIASOUP_MAX_PORT || 49999),
    });

    const worker = await workerPromise;
    worker.on("died", () => {
      console.error("mediasoup worker died, resetting instance");
      workerPromise = null;
    });
  }

  return workerPromise;
}

async function getOrCreateRoom(roomId) {
  const existingRoom = rooms.get(roomId);
  if (existingRoom) {
    return existingRoom;
  }

  const worker = await getWorker();
  const router = await worker.createRouter({ mediaCodecs });
  const room = {
    id: roomId,
    router,
    peers: new Map(),
  };

  rooms.set(roomId, room);
  return room;
}

function getPeer(roomId, peerId) {
  const room = rooms.get(roomId);
  if (!room) {
    throw new Error("Call room not found");
  }

  const peer = room.peers.get(peerId);
  if (!peer) {
    throw new Error("Peer not found in room");
  }

  return { room, peer };
}

function listRoomProducers(room, excludePeerId) {
  const producers = [];

  for (const [peerId, peer] of room.peers.entries()) {
    if (peerId === excludePeerId) continue;

    for (const producer of peer.producers.values()) {
      producers.push({
        producerId: producer.id,
        peerId,
        kind: producer.kind,
        userId: peer.metadata.userId,
        displayName: peer.metadata.displayName,
        avatar: peer.metadata.avatar || "",
      });
    }
  }

  return producers;
}

async function joinRoom({ roomId, peerId, metadata }) {
  const room = await getOrCreateRoom(roomId);
  let peer = room.peers.get(peerId);

  if (!peer) {
    peer = {
      id: peerId,
      metadata,
      transports: new Map(),
      producers: new Map(),
      consumers: new Map(),
    };
    room.peers.set(peerId, peer);
  } else {
    peer.metadata = metadata;
  }

  return {
    routerRtpCapabilities: room.router.rtpCapabilities,
    producers: listRoomProducers(room, peerId),
  };
}

async function createTransport({ roomId, peerId, direction }) {
  const room = await getOrCreateRoom(roomId);
  const peer = room.peers.get(peerId);

  if (!peer) {
    throw new Error("Peer must join room before creating transports");
  }

  const transport = await room.router.createWebRtcTransport({
    listenIps: [
      {
        ip: process.env.MEDIASOUP_LISTEN_IP || "127.0.0.1",
        announcedIp: process.env.MEDIASOUP_ANNOUNCED_IP || undefined,
      },
    ],
    enableUdp: true,
    enableTcp: true,
    preferUdp: true,
    appData: {
      peerId,
      direction,
    },
  });

  peer.transports.set(transport.id, transport);

  transport.on("close", () => {
    peer.transports.delete(transport.id);
  });

  return {
    id: transport.id,
    iceParameters: transport.iceParameters,
    iceCandidates: transport.iceCandidates,
    dtlsParameters: transport.dtlsParameters,
    sctpParameters: transport.sctpParameters,
  };
}

async function connectTransport({ roomId, peerId, transportId, dtlsParameters }) {
  const { peer } = getPeer(roomId, peerId);
  const transport = peer.transports.get(transportId);

  if (!transport) {
    throw new Error("Transport not found");
  }

  await transport.connect({ dtlsParameters });
}

async function produce({ roomId, peerId, transportId, kind, rtpParameters, appData }) {
  const { peer } = getPeer(roomId, peerId);
  const transport = peer.transports.get(transportId);

  if (!transport) {
    throw new Error("Transport not found");
  }

  const producer = await transport.produce({ kind, rtpParameters, appData });
  peer.producers.set(producer.id, producer);

  producer.on("transportclose", () => {
    peer.producers.delete(producer.id);
  });

  producer.on("close", () => {
    peer.producers.delete(producer.id);
  });

  return {
    producerId: producer.id,
    peerId,
    kind: producer.kind,
    userId: peer.metadata.userId,
    displayName: peer.metadata.displayName,
    avatar: peer.metadata.avatar || "",
  };
}

async function consume({ roomId, peerId, transportId, producerId, rtpCapabilities }) {
  const { room, peer } = getPeer(roomId, peerId);
  const transport = peer.transports.get(transportId);

  if (!transport) {
    throw new Error("Transport not found");
  }

  if (!room.router.canConsume({ producerId, rtpCapabilities })) {
    throw new Error("Cannot consume producer");
  }

  let producerPeerId = null;
  let producerPeer = null;

  for (const [candidatePeerId, candidatePeer] of room.peers.entries()) {
    if (candidatePeer.producers.has(producerId)) {
      producerPeerId = candidatePeerId;
      producerPeer = candidatePeer;
      break;
    }
  }

  if (!producerPeerId || !producerPeer) {
    throw new Error("Producer peer not found");
  }

  const consumer = await transport.consume({
    producerId,
    rtpCapabilities,
    paused: true,
  });

  peer.consumers.set(consumer.id, consumer);

  consumer.on("transportclose", () => {
    peer.consumers.delete(consumer.id);
  });

  consumer.on("producerclose", () => {
    peer.consumers.delete(consumer.id);
  });

  return {
    id: consumer.id,
    producerId,
    kind: consumer.kind,
    rtpParameters: consumer.rtpParameters,
    type: consumer.type,
    producerPaused: consumer.producerPaused,
    peerId: producerPeerId,
    userId: producerPeer.metadata.userId,
    displayName: producerPeer.metadata.displayName,
    avatar: producerPeer.metadata.avatar || "",
  };
}

async function resumeConsumer({ roomId, peerId, consumerId }) {
  const { peer } = getPeer(roomId, peerId);
  const consumer = peer.consumers.get(consumerId);

  if (!consumer) {
    throw new Error("Consumer not found");
  }

  await consumer.resume();
}

function closePeer(roomId, peerId) {
  const room = rooms.get(roomId);
  if (!room) {
    return { closedProducerIds: [] };
  }

  const peer = room.peers.get(peerId);
  if (!peer) {
    return { closedProducerIds: [] };
  }

  const closedProducerIds = [...peer.producers.keys()];

  for (const consumer of peer.consumers.values()) {
    consumer.close();
  }

  for (const producer of peer.producers.values()) {
    producer.close();
  }

  for (const transport of peer.transports.values()) {
    transport.close();
  }

  room.peers.delete(peerId);

  if (room.peers.size === 0) {
    room.router.close();
    rooms.delete(roomId);
  }

  return { closedProducerIds };
}

module.exports = {
  joinRoom,
  createTransport,
  connectTransport,
  produce,
  consume,
  resumeConsumer,
  closePeer,
};