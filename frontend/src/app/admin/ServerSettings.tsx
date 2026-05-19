import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

interface ServerChannel {
  _id: string;
  name: string;
  type: "text" | "voice" | "video" | "dm";
}

interface ServerMember {
  _id: string;
  displayName: string;
  username: string;
  avatar: string;
  role: "admin" | "member";
}

interface ServerSettingsProps {
  serverId: string;
  initialName: string;
  initialDescription: string;
  onServerUpdated: (payload: { name: string; description: string }) => void;
}

interface AdminReward {
  id: string;
  name: string;
  description: string;
  costPoints: number;
  rewardType: "badge" | "title" | "item";
  rewardValue: string;
}

export default function ServerSettings({
  serverId,
  initialName,
  initialDescription,
  onServerUpdated,
}: ServerSettingsProps) {
  const { token, user } = useAuth();
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [channels, setChannels] = useState<ServerChannel[]>([]);
  const [members, setMembers] = useState<ServerMember[]>([]);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelType, setNewChannelType] = useState<"text" | "voice" | "video">("text");
  const [rewards, setRewards] = useState<AdminReward[]>([]);
  const [newRewardName, setNewRewardName] = useState("");
  const [newRewardDescription, setNewRewardDescription] = useState("");
  const [newRewardCost, setNewRewardCost] = useState(200);
  const [newRewardType, setNewRewardType] = useState<"badge" | "title" | "item">("badge");
  const [newRewardValue, setNewRewardValue] = useState("🏅");

  useEffect(() => {
    setName(initialName || "");
    setDescription(initialDescription || "");
  }, [initialName, initialDescription]);

  useEffect(() => {
    if (!token) return;
    api<ServerChannel[]>(`/servers/${serverId}/admin/channels`, { token })
      .then(setChannels)
      .catch(console.error);

    api<ServerMember[]>(`/servers/${serverId}/admin/members`, { token })
      .then(setMembers)
      .catch(console.error);

    api<AdminReward[]>(`/servers/${serverId}/admin/rewards`, { token })
      .then(setRewards)
      .catch(console.error);
  }, [token, serverId]);

  const saveSettings = async () => {
    if (!token) return;
    const updated = await api<{ name: string; description: string }>(
      `/servers/${serverId}/admin/settings`,
      {
        token,
        method: "PUT",
        body: { name, description },
      }
    );
    onServerUpdated({ name: updated.name, description: updated.description });
  };

  const addChannel = async () => {
    if (!token || !newChannelName.trim()) return;
    const created = await api<ServerChannel>(`/servers/${serverId}/admin/channels`, {
      token,
      method: "POST",
      body: {
        name: newChannelName.trim(),
        type: newChannelType,
      },
    });
    setChannels((prev) => [...prev, created]);
    setNewChannelName("");
  };

  const removeChannel = async (channelId: string) => {
    if (!token) return;
    await api(`/servers/${serverId}/admin/channels/${channelId}`, {
      token,
      method: "DELETE",
    });
    setChannels((prev) => prev.filter((ch) => ch._id !== channelId));
  };

  const removeMember = async (memberId: string) => {
    if (!token) return;
    await api(`/servers/${serverId}/admin/members/${memberId}`, {
      token,
      method: "DELETE",
    });
    setMembers((prev) => prev.filter((m) => m._id !== memberId));
  };

  const addReward = async () => {
    if (!token || !newRewardName.trim()) return;
    const created = await api<AdminReward>(`/servers/${serverId}/admin/rewards`, {
      token,
      method: "POST",
      body: {
        name: newRewardName.trim(),
        description: newRewardDescription.trim(),
        costPoints: Number(newRewardCost),
        rewardType: newRewardType,
        rewardValue: newRewardValue.trim(),
      },
    });
    setRewards((prev) => [created, ...prev]);
    setNewRewardName("");
    setNewRewardDescription("");
    setNewRewardCost(200);
    setNewRewardType("badge");
    setNewRewardValue("🏅");
  };

  const deleteReward = async (rewardId: string) => {
    if (!token) return;
    await api(`/servers/${serverId}/admin/rewards/${rewardId}`, {
      token,
      method: "DELETE",
    });
    setRewards((prev) => prev.filter((reward) => reward.id !== rewardId));
  };

  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm">
      <div className="card-body space-y-5">
        <h2 className="card-title text-lg">Gestión del servidor</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <label className="form-control w-full">
            <span className="label-text">Nombre del servidor</span>
            <input
              className="input input-bordered w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="form-control w-full">
            <span className="label-text">Descripción</span>
            <input
              className="input input-bordered w-full"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
        </div>

        <div className="flex justify-end">
          <button className="btn btn-primary btn-sm" onClick={saveSettings}>
            Guardar configuración
          </button>
        </div>

        <div className="divider" />

        <div className="space-y-3">
          <h3 className="font-semibold">Premios</h3>
          <div className="grid md:grid-cols-5 gap-2">
            <input
              className="input input-bordered input-sm"
              placeholder="Nombre del premio"
              value={newRewardName}
              onChange={(e) => setNewRewardName(e.target.value)}
            />
            <input
              className="input input-bordered input-sm"
              placeholder="Descripción"
              value={newRewardDescription}
              onChange={(e) => setNewRewardDescription(e.target.value)}
            />
            <input
              className="input input-bordered input-sm"
              type="number"
              min={0}
              value={newRewardCost}
              onChange={(e) => setNewRewardCost(Number(e.target.value) || 0)}
            />
            <select
              className="select select-bordered select-sm"
              value={newRewardType}
              onChange={(e) => setNewRewardType(e.target.value as "badge" | "title" | "item")}
            >
              <option value="badge">Badge</option>
              <option value="title">Título</option>
              <option value="item">Item</option>
            </select>
            <input
              className="input input-bordered input-sm"
              placeholder="Emoji/valor"
              value={newRewardValue}
              onChange={(e) => setNewRewardValue(e.target.value)}
            />
          </div>

          <div className="flex justify-end">
            <button className="btn btn-sm btn-primary" onClick={addReward}>
              Agregar premio
            </button>
          </div>

          <div className="space-y-2">
            {rewards.map((reward) => (
              <div
                key={reward.id}
                className="flex items-center justify-between rounded-lg border border-base-300 px-3 py-2"
              >
                <div className="text-sm">
                  <span className="font-medium">{reward.rewardValue || "🏅"} {reward.name}</span>
                  <span className="text-base-content/50"> · {reward.rewardType} · {reward.costPoints} pts</span>
                </div>
                <button className="btn btn-ghost btn-xs text-error" onClick={() => deleteReward(reward.id)}>
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="divider" />

        <div className="space-y-3">
          <h3 className="font-semibold">Canales</h3>
          <div className="flex flex-wrap gap-2">
            <input
              className="input input-bordered input-sm"
              placeholder="Nombre del canal"
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
            />
            <select
              className="select select-bordered select-sm"
              value={newChannelType}
              onChange={(e) => setNewChannelType(e.target.value as "text" | "voice" | "video")}
            >
              <option value="text">Texto</option>
              <option value="voice">Voz</option>
              <option value="video">Video</option>
            </select>
            <button className="btn btn-sm btn-primary" onClick={addChannel}>
              Agregar canal
            </button>
          </div>

          <div className="space-y-2">
            {channels.map((ch) => (
              <div
                key={ch._id}
                className="flex items-center justify-between rounded-lg border border-base-300 px-3 py-2"
              >
                <div className="text-sm">
                  <span className="font-medium">{ch.name}</span>
                  <span className="text-base-content/50"> · {ch.type}</span>
                </div>
                <button className="btn btn-ghost btn-xs text-error" onClick={() => removeChannel(ch._id)}>
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="divider" />

        <div className="space-y-3">
          <h3 className="font-semibold">Miembros</h3>
          <div className="space-y-2">
            {members.map((member) => {
              const isSelf = member._id === user?._id;
              return (
                <div
                  key={member._id}
                  className="flex items-center justify-between rounded-lg border border-base-300 px-3 py-2"
                >
                  <div className="text-sm">
                    <span className="font-medium">{member.displayName}</span>
                    <span className="text-base-content/50"> @{member.username}</span>
                    <span className="badge badge-ghost badge-xs ml-2">{member.role}</span>
                  </div>
                  <button
                    className="btn btn-ghost btn-xs text-error"
                    onClick={() => removeMember(member._id)}
                    disabled={isSelf || member.role === "admin"}
                  >
                    Expulsar
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
