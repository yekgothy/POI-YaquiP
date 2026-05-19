const bcrypt = require("bcryptjs");
const { supabase } = require("./supabase");

const DEFAULT_SERVER_ID = "world-cup-hub";
const DEFAULT_SERVER_NAME = "World Cup Hub";

function ensureNoError(result, fallbackMessage) {
  if (result.error) {
    throw new Error(result.error.message || fallbackMessage);
  }
  return result.data;
}

function mapUser(row) {
  if (!row) return null;
  return {
    _id: row.id,
    displayName: row.display_name,
    username: row.username,
    email: row.email,
    avatar: row.avatar || "",
    bio: row.bio || "",
    favoriteTeam: row.favorite_team || "",
    country: row.country || "",
    city: row.city || "",
    online: !!row.online,
    lastSeen: row.last_seen,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapChannel(row) {
  return {
    _id: row.id,
    name: row.name,
    type: row.type,
    team: row.team,
    description: row.description || "",
    isDM: !!row.is_dm,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function getChannelServerKey(channel) {
  return channel?.isDM ? "dms" : channel?.team;
}

function mapMessage(row, sender) {
  return {
    _id: row.id,
    content: row.content,
    sender,
    channel: row.channel_id,
    type: row.type,
    attachment: row.attachment_url
      ? {
          url: row.attachment_url,
          path: row.attachment_path || "",
          name: row.attachment_name || "archivo",
          size: row.attachment_size || 0,
          mimeType: row.attachment_mime || "application/octet-stream",
        }
      : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function slugifyServerName(name) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 40);
}

function mapServer(row, role) {
  return {
    _id: row.id,
    name: row.name,
    description: row.description || "",
    visibility: row.visibility || "public",
    isDefault: !!row.is_default,
    createdBy: row.created_by,
    createdAt: row.created_at,
    role,
    isAdmin: role === "admin",
  };
}

function mapTask(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    type: row.type,
    difficulty: row.difficulty,
    xp: row.xp,
    status: row.active ? "available" : "locked",
    location: row.location || undefined,
    deadline: row.deadline || undefined,
    badge: row.badge || "⭐",
    image: row.image || undefined,
    category: row.category,
    createdAt: row.created_at,
    createdBy: row.created_by,
    active: !!row.active,
    completedBy: 0,
    totalParticipants: 0,
  };
}

function levelFromXp(xp) {
  return Math.max(1, Math.floor(Math.sqrt((xp || 0) / 120)) + 1);
}

function xpToNextLevel(level) {
  const nextLevel = Math.max(2, level + 1);
  return nextLevel * nextLevel * 120;
}

function mapReward(row, owned = false) {
  return {
    id: row.id,
    name: row.name,
    description: row.description || "",
    costPoints: row.cost_points,
    rewardType: row.reward_type,
    rewardValue: row.reward_value,
    active: !!row.active,
    owned,
    createdAt: row.created_at,
  };
}

async function ping() {
  const result = await supabase.from("users").select("id").limit(1);
  if (result.error) {
    const msg = (result.error.message || "").toLowerCase();
    const missingTable =
      msg.includes("could not find the table") ||
      msg.includes("relation") ||
      msg.includes("does not exist");

    if (missingTable) {
      throw new Error(
        "Supabase schema is missing. Run backend/supabase/schema.sql and backend/supabase/seed.sql in Supabase SQL Editor."
      );
    }

    throw new Error(result.error.message);
  }
}

async function findUserById(userId) {
  const result = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  const row = ensureNoError(result, "Failed to fetch user");
  return mapUser(row);
}

async function findUserWithPasswordByEmail(email) {
  const result = await supabase
    .from("users")
    .select("*")
    .eq("email", email.toLowerCase())
    .maybeSingle();
  const row = ensureNoError(result, "Failed to fetch user by email");
  return row;
}

async function findExistingByEmailOrUsername(email, username) {
  const normalizedEmail = email.toLowerCase();
  const normalizedUsername = username.toLowerCase();

  const byEmailResult = await supabase
    .from("users")
    .select("id, email")
    .eq("email", normalizedEmail)
    .maybeSingle();
  const byEmail = ensureNoError(byEmailResult, "Failed to verify email");
  if (byEmail) return { field: "correo" };

  const byUsernameResult = await supabase
    .from("users")
    .select("id, username")
    .eq("username", normalizedUsername)
    .maybeSingle();
  const byUsername = ensureNoError(byUsernameResult, "Failed to verify username");
  if (byUsername) return { field: "nombre de usuario" };

  return null;
}

async function createUser({ displayName, username, email, password }) {
  const passwordHash = await bcrypt.hash(password, 10);
  const result = await supabase
    .from("users")
    .insert({
      display_name: displayName,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password_hash: passwordHash,
    })
    .select("*")
    .single();

  const row = ensureNoError(result, "Failed to create user");
  return mapUser(row);
}

async function ensureDefaultServerExists() {
  const serverResult = await supabase
    .from("servers")
    .select("*")
    .eq("id", DEFAULT_SERVER_ID)
    .maybeSingle();
  const existing = ensureNoError(serverResult, "Failed to verify default server");
  if (existing) return mapServer(existing, null);

  const createResult = await supabase
    .from("servers")
    .insert({
      id: DEFAULT_SERVER_ID,
      name: DEFAULT_SERVER_NAME,
      description: "Servidor oficial de la comunidad World Cup Hub",
      visibility: "public",
      is_default: true,
    })
    .select("*")
    .single();
  const created = ensureNoError(createResult, "Failed to create default server");
  return mapServer(created, null);
}

async function addUserToServer(serverId, userId, role = "member") {
  const result = await supabase.from("server_members").upsert(
    {
      server_id: serverId,
      user_id: userId,
      role,
    },
    {
      onConflict: "server_id,user_id",
      ignoreDuplicates: true,
    }
  );
  ensureNoError(result, "Failed to add user to server");
}

async function ensureUserInDefaultServer(userId) {
  await ensureDefaultServerExists();
  await addUserToServer(DEFAULT_SERVER_ID, userId, "member");
}

async function listServersForUser(userId) {
  const membershipsResult = await supabase
    .from("server_members")
    .select("server_id,role")
    .eq("user_id", userId);
  const memberships = ensureNoError(membershipsResult, "Failed to fetch server memberships");
  if (!memberships.length) return [];

  const serverIds = memberships.map((m) => m.server_id);
  const serversResult = await supabase
    .from("servers")
    .select("*")
    .in("id", serverIds)
    .order("name", { ascending: true });
  const servers = ensureNoError(serversResult, "Failed to list servers");

  const roleByServer = new Map(memberships.map((m) => [m.server_id, m.role]));
  return servers.map((s) => mapServer(s, roleByServer.get(s.id) || "member"));
}

async function isServerMember(userId, serverId) {
  const result = await supabase
    .from("server_members")
    .select("server_id")
    .eq("user_id", userId)
    .eq("server_id", serverId)
    .maybeSingle();
  const data = ensureNoError(result, "Failed to verify server membership");
  return !!data;
}

async function isServerAdmin(userId, serverId) {
  const result = await supabase
    .from("server_members")
    .select("role")
    .eq("user_id", userId)
    .eq("server_id", serverId)
    .maybeSingle();
  const data = ensureNoError(result, "Failed to verify server admin role");
  return data?.role === "admin";
}

async function createServer({ name, description, creatorId }) {
  const baseId = slugifyServerName(name) || "server";
  let nextId = baseId;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const existsResult = await supabase
      .from("servers")
      .select("id")
      .eq("id", nextId)
      .maybeSingle();
    const exists = ensureNoError(existsResult, "Failed to verify server id");
    if (!exists) break;
    nextId = `${baseId}-${Math.floor(Math.random() * 10000)}`;
  }

  const createResult = await supabase
    .from("servers")
    .insert({
      id: nextId,
      name,
      description: description || "",
      visibility: "public",
      created_by: creatorId,
      is_default: false,
    })
    .select("*")
    .single();
  const created = ensureNoError(createResult, "Failed to create server");

  await addUserToServer(created.id, creatorId, "admin");
  return mapServer(created, "admin");
}

async function discoverServersForUser(userId, query) {
  const membershipsResult = await supabase
    .from("server_members")
    .select("server_id")
    .eq("user_id", userId);
  const memberships = ensureNoError(membershipsResult, "Failed to fetch memberships for discover");
  const joinedIds = new Set(memberships.map((m) => m.server_id));

  let serversQuery = supabase
    .from("servers")
    .select("*")
    .eq("visibility", "public")
    .order("created_at", { ascending: false });

  if (query) {
    serversQuery = serversQuery.ilike("name", `%${query}%`);
  }

  const serversResult = await serversQuery;
  let servers = ensureNoError(serversResult, "Failed to discover servers");
  servers = servers.filter((s) => !joinedIds.has(s.id));

  const creatorIds = [...new Set(servers.map((s) => s.created_by).filter(Boolean))];
  let creatorById = new Map();

  if (creatorIds.length) {
    const creatorsResult = await supabase
      .from("users")
      .select("id,display_name,username")
      .in("id", creatorIds);
    const creators = ensureNoError(creatorsResult, "Failed to fetch server creators");
    creatorById = new Map(
      creators.map((u) => [u.id, { displayName: u.display_name, username: u.username }])
    );
  }

  let discovered = servers.map((server) => {
    const creator = creatorById.get(server.created_by);
    return {
      ...mapServer(server, null),
      createdByName: creator?.displayName || "Sistema",
      createdByUsername: creator?.username || "system",
    };
  });

  if (query) {
    const q = query.toLowerCase();
    discovered = discovered.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.createdByName.toLowerCase().includes(q) ||
        s.createdByUsername.toLowerCase().includes(q)
    );
  }

  return discovered;
}

async function joinServer(userId, serverId) {
  const existsResult = await supabase
    .from("servers")
    .select("*")
    .eq("id", serverId)
    .maybeSingle();
  const server = ensureNoError(existsResult, "Failed to verify server");
  if (!server) {
    throw new Error("Servidor no encontrado");
  }
  if (server.visibility !== "public") {
    throw new Error("Este servidor no permite uniones públicas");
  }

  await addUserToServer(serverId, userId, "member");
  await ensureDefaultChannelsForServer(serverId);
  return mapServer(server, "member");
}

async function updateServerSettings(serverId, { name, description, visibility }) {
  const payload = {};
  if (name !== undefined) payload.name = name;
  if (description !== undefined) payload.description = description;
  if (visibility !== undefined) payload.visibility = visibility;

  const result = await supabase
    .from("servers")
    .update(payload)
    .eq("id", serverId)
    .select("*")
    .single();
  const row = ensureNoError(result, "Failed to update server settings");
  return mapServer(row, null);
}

async function listServerMembers(serverId) {
  const membersResult = await supabase
    .from("server_members")
    .select("user_id,role,created_at")
    .eq("server_id", serverId)
    .order("created_at", { ascending: true });
  const members = ensureNoError(membersResult, "Failed to list server members");

  const userIds = [...new Set(members.map((m) => m.user_id))];
  if (!userIds.length) return [];

  const usersResult = await supabase.from("users").select("*").in("id", userIds);
  const users = ensureNoError(usersResult, "Failed to fetch member users");
  const userById = new Map(users.map((u) => [u.id, mapUser(u)]));

  return members
    .map((m) => ({
      ...userById.get(m.user_id),
      role: m.role,
      joinedAt: m.created_at,
    }))
    .filter((m) => !!m._id);
}

async function removeServerMember(serverId, userId) {
  const result = await supabase
    .from("server_members")
    .delete()
    .eq("server_id", serverId)
    .eq("user_id", userId);
  ensureNoError(result, "Failed to remove server member");
}

async function listServerChannels(serverId) {
  const result = await supabase
    .from("channels")
    .select("*")
    .eq("team", serverId)
    .eq("is_dm", false)
    .order("type", { ascending: true })
    .order("name", { ascending: true });
  const rows = ensureNoError(result, "Failed to list server channels");
  return rows.map(mapChannel);
}

async function createServerChannel(serverId, data) {
  const result = await supabase
    .from("channels")
    .insert({
      name: data.name,
      type: data.type,
      team: serverId,
      description: data.description || "",
      is_dm: false,
    })
    .select("*")
    .single();
  const row = ensureNoError(result, "Failed to create server channel");
  return mapChannel(row);
}

async function deleteServerChannel(serverId, channelId) {
  const result = await supabase
    .from("channels")
    .delete()
    .eq("id", channelId)
    .eq("team", serverId)
    .eq("is_dm", false);
  ensureNoError(result, "Failed to delete server channel");
}

async function compareUserPassword(email, password) {
  const row = await findUserWithPasswordByEmail(email);
  if (!row) return null;

  const isMatch = await bcrypt.compare(password, row.password_hash);
  if (!isMatch) return null;

  return mapUser(row);
}

async function setUserOnline(userId, online) {
  const payload = online
    ? { online: true }
    : { online: false, last_seen: new Date().toISOString() };

  const result = await supabase
    .from("users")
    .update(payload)
    .eq("id", userId)
    .select("*")
    .single();

  const row = ensureNoError(result, "Failed to update online state");
  return mapUser(row);
}

async function listOtherUsers(currentUserId, serverId) {
  if (!serverId) {
    const result = await supabase
      .from("users")
      .select("*")
      .neq("id", currentUserId)
      .order("online", { ascending: false })
      .order("display_name", { ascending: true });

    const rows = ensureNoError(result, "Failed to list users");
    return rows.map(mapUser);
  }

  const membersResult = await supabase
    .from("server_members")
    .select("user_id")
    .eq("server_id", serverId);
  const memberRows = ensureNoError(membersResult, "Failed to list server members");
  const userIds = [...new Set(memberRows.map((m) => m.user_id))].filter((id) => id !== currentUserId);
  if (!userIds.length) return [];

  const usersResult = await supabase
    .from("users")
    .select("*")
    .in("id", userIds)
    .order("online", { ascending: false })
    .order("display_name", { ascending: true });
  const rows = ensureNoError(usersResult, "Failed to fetch server users");
  return rows.map(mapUser);
}

async function updateUserProfile(userId, updates) {
  const map = {
    displayName: "display_name",
    bio: "bio",
    favoriteTeam: "favorite_team",
    country: "country",
    city: "city",
    avatar: "avatar",
  };

  const payload = {};
  for (const [key, value] of Object.entries(updates)) {
    if (map[key]) payload[map[key]] = value;
  }

  const result = await supabase
    .from("users")
    .update(payload)
    .eq("id", userId)
    .select("*")
    .single();

  const row = ensureNoError(result, "Failed to update profile");
  return mapUser(row);
}

async function findChannelByNameAndTeam(name, team) {
  const result = await supabase
    .from("channels")
    .select("*")
    .eq("name", name)
    .eq("team", team)
    .maybeSingle();
  const row = ensureNoError(result, "Failed to find channel");
  return row ? mapChannel(row) : null;
}

async function findChannelById(channelId) {
  const result = await supabase
    .from("channels")
    .select("*")
    .eq("id", channelId)
    .maybeSingle();
  const row = ensureNoError(result, "Failed to find channel by id");
  return row ? mapChannel(row) : null;
}

async function canUserAccessChannel(userId, channelId) {
  const channel = await findChannelById(channelId);
  if (!channel) return false;

  if (channel.isDM) {
    const memberResult = await supabase
      .from("channel_members")
      .select("channel_id")
      .eq("channel_id", channelId)
      .eq("user_id", userId)
      .maybeSingle();
    const member = ensureNoError(memberResult, "Failed to verify DM membership");
    return !!member;
  }

  return isServerMember(userId, channel.team);
}

async function listRecipientUserIdsForChannel(channelId) {
  const channel = await findChannelById(channelId);
  if (!channel) return [];

  if (channel.isDM) {
    const result = await supabase
      .from("channel_members")
      .select("user_id")
      .eq("channel_id", channelId);
    const rows = ensureNoError(result, "Failed to list DM recipients");
    return [...new Set(rows.map((row) => row.user_id))];
  }

  const result = await supabase
    .from("server_members")
    .select("user_id")
    .eq("server_id", channel.team);
  const rows = ensureNoError(result, "Failed to list server recipients");
  return [...new Set(rows.map((row) => row.user_id))];
}

async function createChannel(data) {
  const result = await supabase
    .from("channels")
    .insert({
      name: data.name,
      type: data.type || "text",
      team: data.team,
      description: data.description || "",
      is_dm: !!data.isDM,
    })
    .select("*")
    .single();
  const row = ensureNoError(result, "Failed to create channel");
  return mapChannel(row);
}

async function ensureDefaultChannelsForServer(serverId) {
  const defaultChannels = [
    { name: "general", type: "text", team: serverId },
    { name: "anuncios", type: "text", team: serverId },
    { name: "sala-voz", type: "voice", team: serverId },
  ];

  for (const ch of defaultChannels) {
    const exists = await findChannelByNameAndTeam(ch.name, ch.team);
    if (!exists) {
      await createChannel(ch);
    }
  }
}

async function listChannels(team) {
  let query = supabase
    .from("channels")
    .select("*")
    .eq("is_dm", false)
    .order("name", { ascending: true });
  if (team) query = query.eq("team", team);

  const result = await query;
  const rows = ensureNoError(result, "Failed to list channels");
  return rows.map(mapChannel);
}

async function addMembersToChannel(channelId, userIds) {
  if (!userIds.length) return;
  const rows = userIds.map((userId) => ({ channel_id: channelId, user_id: userId }));
  const result = await supabase.from("channel_members").upsert(rows, {
    onConflict: "channel_id,user_id",
    ignoreDuplicates: true,
  });
  ensureNoError(result, "Failed to add channel members");
}

async function getMembersByChannelIds(channelIds) {
  if (!channelIds.length) return new Map();

  const memberResult = await supabase
    .from("channel_members")
    .select("channel_id,user_id")
    .in("channel_id", channelIds);
  const memberRows = ensureNoError(memberResult, "Failed to fetch channel members");

  const userIds = [...new Set(memberRows.map((m) => m.user_id))];
  if (!userIds.length) return new Map();

  const userResult = await supabase.from("users").select("*").in("id", userIds);
  const userRows = ensureNoError(userResult, "Failed to fetch users for channel members");
  const userById = new Map(userRows.map((u) => [u.id, mapUser(u)]));

  const membersByChannel = new Map();
  for (const member of memberRows) {
    const existing = membersByChannel.get(member.channel_id) || [];
    const mappedUser = userById.get(member.user_id);
    if (mappedUser) existing.push(mappedUser);
    membersByChannel.set(member.channel_id, existing);
  }

  return membersByChannel;
}

async function listDMChannelsForUser(userId) {
  const membershipResult = await supabase
    .from("channel_members")
    .select("channel_id")
    .eq("user_id", userId);
  const memberships = ensureNoError(membershipResult, "Failed to fetch memberships");

  const channelIds = [...new Set(memberships.map((m) => m.channel_id))];
  if (!channelIds.length) return [];

  const channelsResult = await supabase
    .from("channels")
    .select("*")
    .in("id", channelIds)
    .eq("is_dm", true)
    .order("updated_at", { ascending: false });
  const channels = ensureNoError(channelsResult, "Failed to fetch DM channels");

  const membersByChannel = await getMembersByChannelIds(channels.map((c) => c.id));
  return channels.map((row) => ({
    ...mapChannel(row),
    members: membersByChannel.get(row.id) || [],
  }));
}

async function findExistingDMChannel(userAId, userBId) {
  const [aMembershipsResult, bMembershipsResult] = await Promise.all([
    supabase.from("channel_members").select("channel_id").eq("user_id", userAId),
    supabase.from("channel_members").select("channel_id").eq("user_id", userBId),
  ]);

  const aMemberships = ensureNoError(aMembershipsResult, "Failed to fetch memberships for user A");
  const bMemberships = ensureNoError(bMembershipsResult, "Failed to fetch memberships for user B");

  const setB = new Set(bMemberships.map((m) => m.channel_id));
  const shared = [...new Set(aMemberships.map((m) => m.channel_id))].filter((id) => setB.has(id));
  if (!shared.length) return null;

  const channelResult = await supabase
    .from("channels")
    .select("*")
    .in("id", shared)
    .eq("is_dm", true)
    .limit(1)
    .maybeSingle();
  const row = ensureNoError(channelResult, "Failed to find DM channel");
  if (!row) return null;

  const membersByChannel = await getMembersByChannelIds([row.id]);
  return {
    ...mapChannel(row),
    members: membersByChannel.get(row.id) || [],
  };
}

async function createDMChannel(userAId, userBId) {
  const channel = await createChannel({
    name: "DM",
    type: "dm",
    team: "dms",
    isDM: true,
  });

  await addMembersToChannel(channel._id, [userAId, userBId]);
  const membersByChannel = await getMembersByChannelIds([channel._id]);
  return {
    ...channel,
    members: membersByChannel.get(channel._id) || [],
  };
}

async function listMessages(channelId, limit, before) {
  let query = supabase
    .from("messages")
    .select("*")
    .eq("channel_id", channelId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (before) {
    query = query.lt("created_at", before);
  }

  const result = await query;
  const messageRows = ensureNoError(result, "Failed to load messages");

  const senderIds = [...new Set(messageRows.map((m) => m.sender_id))];
  const usersResult = await supabase.from("users").select("*").in("id", senderIds);
  const users = ensureNoError(usersResult, "Failed to load message senders");
  const userById = new Map(users.map((u) => [u.id, mapUser(u)]));

  return messageRows
    .map((row) => mapMessage(row, userById.get(row.sender_id)))
    .reverse();
}

async function createMessage({ content, senderId, channelId, type = "text", attachment = null }) {
  let insertResult = await supabase
    .from("messages")
    .insert({
      content,
      sender_id: senderId,
      channel_id: channelId,
      type,
      attachment_url: attachment?.url || null,
      attachment_path: attachment?.path || null,
      attachment_name: attachment?.name || null,
      attachment_size: attachment?.size || null,
      attachment_mime: attachment?.mimeType || null,
    })
    .select("*")
    .single();

  // Backward compatibility for projects that still have the old messages schema.
  if (insertResult.error) {
    const message = (insertResult.error.message || "").toLowerCase();
    const missingAttachmentColumns =
      message.includes("attachment_url") ||
      message.includes("attachment_path") ||
      message.includes("attachment_name") ||
      message.includes("attachment_size") ||
      message.includes("attachment_mime") ||
      message.includes("schema cache");
    const unsupportedType = message.includes("messages_type_check");

    if (missingAttachmentColumns || unsupportedType) {
      const legacyType = ["text", "image", "system"].includes(type) ? type : "text";
      const legacyContent = attachment?.url
        ? `${String(content || "").trim()} ${attachment.url}`.trim()
        : String(content || "").trim();

      insertResult = await supabase
        .from("messages")
        .insert({
          content: legacyContent || attachment?.name || "Archivo",
          sender_id: senderId,
          channel_id: channelId,
          type: legacyType,
        })
        .select("*")
        .single();
    }
  }

  const row = ensureNoError(insertResult, "Failed to insert message");
  const sender = await findUserById(senderId);
  return mapMessage(row, sender);
}

async function markChannelRead(userId, channelId) {
  const canAccess = await canUserAccessChannel(userId, channelId);
  if (!canAccess) {
    throw new Error("No tienes acceso a este canal");
  }

  const result = await supabase.from("channel_reads").upsert(
    {
      channel_id: channelId,
      user_id: userId,
      last_read_at: new Date().toISOString(),
    },
    {
      onConflict: "channel_id,user_id",
    }
  );
  ensureNoError(result, "Failed to mark channel as read");
}

async function getUnreadCountsForUser(userId) {
  const membershipsResult = await supabase
    .from("server_members")
    .select("server_id")
    .eq("user_id", userId);
  const memberships = ensureNoError(membershipsResult, "Failed to fetch server memberships");
  const serverIds = [...new Set(memberships.map((m) => m.server_id))];

  const dmMembershipResult = await supabase
    .from("channel_members")
    .select("channel_id")
    .eq("user_id", userId);
  const dmMemberships = ensureNoError(dmMembershipResult, "Failed to fetch DM memberships");
  const dmChannelIds = [...new Set(dmMemberships.map((m) => m.channel_id))];

  const [serverChannelsResult, dmChannelsResult] = await Promise.all([
    serverIds.length
      ? supabase.from("channels").select("id,team,is_dm").in("team", serverIds).eq("is_dm", false)
      : Promise.resolve({ data: [], error: null }),
    dmChannelIds.length
      ? supabase.from("channels").select("id,team,is_dm").in("id", dmChannelIds).eq("is_dm", true)
      : Promise.resolve({ data: [], error: null }),
  ]);

  const serverChannels = ensureNoError(serverChannelsResult, "Failed to fetch server channels");
  const dmChannels = ensureNoError(dmChannelsResult, "Failed to fetch DM channels");
  const allChannels = [...serverChannels, ...dmChannels];
  const allChannelIds = allChannels.map((channel) => channel.id);

  if (!allChannelIds.length) {
    return {
      total: 0,
      dmTotal: 0,
      byChannel: {},
      byServer: {},
    };
  }

  const [readsResult, messagesResult] = await Promise.all([
    supabase
      .from("channel_reads")
      .select("channel_id,last_read_at")
      .eq("user_id", userId)
      .in("channel_id", allChannelIds),
    supabase
      .from("messages")
      .select("channel_id,created_at,sender_id")
      .in("channel_id", allChannelIds)
      .neq("sender_id", userId),
  ]);

  const reads = ensureNoError(readsResult, "Failed to fetch read markers");
  const messages = ensureNoError(messagesResult, "Failed to fetch unread messages");

  const lastReadMap = new Map(reads.map((read) => [read.channel_id, Date.parse(read.last_read_at)]));
  const channelMeta = new Map(allChannels.map((channel) => [channel.id, mapChannel(channel)]));

  const byChannel = {};
  const byServer = {};
  let total = 0;
  let dmTotal = 0;

  for (const message of messages) {
    const lastReadAt = lastReadMap.get(message.channel_id) || 0;
    const createdAt = Date.parse(message.created_at);
    if (Number.isNaN(createdAt) || createdAt <= lastReadAt) continue;

    byChannel[message.channel_id] = (byChannel[message.channel_id] || 0) + 1;

    const channel = channelMeta.get(message.channel_id);
    const serverKey = getChannelServerKey(channel);
    if (serverKey) {
      byServer[serverKey] = (byServer[serverKey] || 0) + 1;
      if (serverKey === "dms") dmTotal += 1;
    }

    total += 1;
  }

  return {
    total,
    dmTotal,
    byChannel,
    byServer,
  };
}

async function listTasksForServer(serverId, userId, includeInactive = false) {
  let query = supabase
    .from("tasks")
    .select("*")
    .eq("server_id", serverId)
    .order("created_at", { ascending: false });

  if (!includeInactive) {
    query = query.eq("active", true);
  }

  const result = await query;
  const rows = ensureNoError(result, "Failed to list tasks");
  const mapped = rows.map(mapTask);

  if (!userId) {
    return mapped;
  }

  const taskIds = mapped.map((t) => t.id);
  if (!taskIds.length) return mapped;

  const completionResult = await supabase
    .from("task_completions")
    .select("task_id")
    .eq("user_id", userId)
    .in("task_id", taskIds);
  const completions = ensureNoError(completionResult, "Failed to load task completions");
  const completedIds = new Set(completions.map((c) => c.task_id));

  return mapped.map((task) => {
    if (completedIds.has(task.id)) {
      return { ...task, status: "completed" };
    }
    return task;
  });
}

async function createTask(serverId, createdBy, data) {
  const payload = {
    server_id: serverId,
    created_by: createdBy,
    title: data.title,
    description: data.description,
    type: data.type,
    difficulty: data.difficulty,
    xp: data.xp,
    category: data.category,
    location: data.location || null,
    deadline: data.deadline || null,
    badge: data.badge || "⭐",
    image: data.image || null,
    active: data.active !== false,
  };

  const result = await supabase.from("tasks").insert(payload).select("*").single();
  const row = ensureNoError(result, "Failed to create task");
  return mapTask(row);
}

async function updateTask(serverId, taskId, data) {
  const payload = {
    title: data.title,
    description: data.description,
    type: data.type,
    difficulty: data.difficulty,
    xp: data.xp,
    category: data.category,
    location: data.location || null,
    deadline: data.deadline || null,
    badge: data.badge || "⭐",
    image: data.image || null,
    active: data.active !== false,
  };

  const result = await supabase
    .from("tasks")
    .update(payload)
    .eq("id", taskId)
    .eq("server_id", serverId)
    .select("*")
    .single();
  const row = ensureNoError(result, "Failed to update task");
  return mapTask(row);
}

async function setTaskActive(serverId, taskId, active) {
  const result = await supabase
    .from("tasks")
    .update({ active })
    .eq("id", taskId)
    .eq("server_id", serverId)
    .select("*")
    .single();
  const row = ensureNoError(result, "Failed to update task status");
  return mapTask(row);
}

async function deleteTask(serverId, taskId) {
  const result = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId)
    .eq("server_id", serverId);
  ensureNoError(result, "Failed to delete task");
}

async function getOrCreateServerProgress(serverId, userId) {
  const result = await supabase
    .from("server_user_progress")
    .select("*")
    .eq("server_id", serverId)
    .eq("user_id", userId)
    .maybeSingle();
  const existing = ensureNoError(result, "Failed to load server progress");
  if (existing) return existing;

  const createResult = await supabase
    .from("server_user_progress")
    .insert({
      server_id: serverId,
      user_id: userId,
      xp: 0,
      points: 0,
      level: 1,
      tasks_completed: 0,
    })
    .select("*")
    .single();
  return ensureNoError(createResult, "Failed to initialize server progress");
}

async function completeTask(serverId, taskId, userId) {
  const taskResult = await supabase
    .from("tasks")
    .select("*")
    .eq("id", taskId)
    .eq("server_id", serverId)
    .eq("active", true)
    .maybeSingle();
  const task = ensureNoError(taskResult, "Failed to load task");
  if (!task) {
    throw new Error("Tarea no encontrada o inactiva");
  }

  const existingCompletionResult = await supabase
    .from("task_completions")
    .select("task_id")
    .eq("task_id", taskId)
    .eq("user_id", userId)
    .maybeSingle();
  const existingCompletion = ensureNoError(
    existingCompletionResult,
    "Failed to verify task completion"
  );
  if (existingCompletion) {
    throw new Error("Esta tarea ya fue completada");
  }

  const insertCompletionResult = await supabase.from("task_completions").insert({
    server_id: serverId,
    task_id: taskId,
    user_id: userId,
  });
  ensureNoError(insertCompletionResult, "Failed to complete task");

  const progress = await getOrCreateServerProgress(serverId, userId);
  const previousLevel = progress.level || 1;
  const newXp = (progress.xp || 0) + task.xp;
  const newPoints = (progress.points || 0) + task.xp;
  const newCompleted = (progress.tasks_completed || 0) + 1;
  const newLevel = levelFromXp(newXp);

  const updateResult = await supabase
    .from("server_user_progress")
    .update({
      xp: newXp,
      points: newPoints,
      level: newLevel,
      tasks_completed: newCompleted,
      last_task_at: new Date().toISOString(),
    })
    .eq("server_id", serverId)
    .eq("user_id", userId)
    .select("*")
    .single();
  const updated = ensureNoError(updateResult, "Failed to update progress after completion");

  return {
    awardedXp: task.xp,
    awardedPoints: task.xp,
    levelUp: newLevel > previousLevel,
    previousLevel,
    newLevel,
    progress: {
      level: updated.level,
      xp: updated.xp,
      points: updated.points,
      tasksCompleted: updated.tasks_completed,
      xpToNext: xpToNextLevel(updated.level),
    },
  };
}

async function getServerProgress(serverId, userId) {
  const progress = await getOrCreateServerProgress(serverId, userId);

  const leaderboardResult = await supabase
    .from("server_user_progress")
    .select("user_id,xp,level,tasks_completed")
    .eq("server_id", serverId)
    .order("xp", { ascending: false })
    .limit(50);
  const leaderboard = ensureNoError(leaderboardResult, "Failed to load leaderboard");

  const userIds = leaderboard.map((entry) => entry.user_id);
  const usersResult = await supabase.from("users").select("id,display_name").in("id", userIds);
  const users = ensureNoError(usersResult, "Failed to load leaderboard users");
  const nameById = new Map(users.map((u) => [u.id, u.display_name]));

  const mappedLeaderboard = leaderboard.map((entry, index) => ({
    rank: index + 1,
    userId: entry.user_id,
    name: nameById.get(entry.user_id) || "Usuario",
    xp: entry.xp,
    level: entry.level,
    tasksCompleted: entry.tasks_completed,
    isYou: entry.user_id === userId,
  }));

  const rankEntry = mappedLeaderboard.find((entry) => entry.userId === userId);

  return {
    stats: {
      level: progress.level,
      xp: progress.xp,
      points: progress.points,
      tasksCompleted: progress.tasks_completed,
      rank: rankEntry?.rank || mappedLeaderboard.length + 1,
      xpToNext: xpToNextLevel(progress.level),
    },
    leaderboard: mappedLeaderboard,
  };
}

async function listRewardsForAdmin(serverId) {
  const result = await supabase
    .from("rewards_catalog")
    .select("*")
    .eq("server_id", serverId)
    .order("created_at", { ascending: false });
  const rows = ensureNoError(result, "Failed to load rewards for admin");
  return rows.map((row) => mapReward(row));
}

async function createReward(serverId, data) {
  const payload = {
    server_id: serverId,
    name: data.name,
    description: data.description || "",
    cost_points: data.costPoints,
    reward_type: data.rewardType || "badge",
    reward_value: data.rewardValue || "",
    active: data.active !== false,
  };

  const result = await supabase.from("rewards_catalog").insert(payload).select("*").single();
  const row = ensureNoError(result, "Failed to create reward");
  return mapReward(row);
}

async function deleteReward(serverId, rewardId) {
  const result = await supabase
    .from("rewards_catalog")
    .delete()
    .eq("id", rewardId)
    .eq("server_id", serverId);
  ensureNoError(result, "Failed to delete reward");
}

async function listRewardsForUser(serverId, userId) {
  const rewardsResult = await supabase
    .from("rewards_catalog")
    .select("*")
    .eq("server_id", serverId)
    .eq("active", true)
    .order("cost_points", { ascending: true });
  const rewards = ensureNoError(rewardsResult, "Failed to load rewards");

  const ownedResult = await supabase
    .from("user_rewards")
    .select("reward_id")
    .eq("server_id", serverId)
    .eq("user_id", userId);
  const ownedRows = ensureNoError(ownedResult, "Failed to load owned rewards");
  const ownedIds = new Set(ownedRows.map((r) => r.reward_id));

  const progress = await getOrCreateServerProgress(serverId, userId);

  return {
    points: progress.points,
    rewards: rewards.map((reward) => mapReward(reward, ownedIds.has(reward.id))),
  };
}

async function redeemReward(serverId, userId, rewardId) {
  const rewardResult = await supabase
    .from("rewards_catalog")
    .select("*")
    .eq("id", rewardId)
    .eq("server_id", serverId)
    .eq("active", true)
    .maybeSingle();
  const reward = ensureNoError(rewardResult, "Failed to verify reward");
  if (!reward) throw new Error("Premio no encontrado");

  const ownedResult = await supabase
    .from("user_rewards")
    .select("id")
    .eq("reward_id", rewardId)
    .eq("server_id", serverId)
    .eq("user_id", userId)
    .maybeSingle();
  const owned = ensureNoError(ownedResult, "Failed to verify owned reward");
  if (owned) throw new Error("Este premio ya fue canjeado");

  const progress = await getOrCreateServerProgress(serverId, userId);
  if ((progress.points || 0) < reward.cost_points) {
    throw new Error("No tienes puntos suficientes para canjear este premio");
  }

  const insertResult = await supabase.from("user_rewards").insert({
    server_id: serverId,
    user_id: userId,
    reward_id: rewardId,
  });
  ensureNoError(insertResult, "Failed to redeem reward");

  const newPoints = (progress.points || 0) - reward.cost_points;
  const updateResult = await supabase
    .from("server_user_progress")
    .update({ points: newPoints })
    .eq("server_id", serverId)
    .eq("user_id", userId)
    .select("points")
    .single();
  const updated = ensureNoError(updateResult, "Failed to update points after redemption");

  return {
    points: updated.points,
    reward: mapReward(reward, true),
  };
}

async function getUserProfileOverview(targetUserId, serverId) {
  const user = await findUserById(targetUserId);
  if (!user) throw new Error("Usuario no encontrado");

  const profile = {
    user: {
      _id: user._id,
      displayName: user.displayName,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      favoriteTeam: user.favoriteTeam,
      country: user.country,
      city: user.city,
      online: !!user.online,
      createdAt: user.createdAt,
    },
    serverId: serverId || null,
    stats: {
      level: 1,
      xp: 0,
      points: 0,
      tasksCompleted: 0,
      trophiesUnlocked: 0,
      rank: 1,
      xpToNext: xpToNextLevel(1),
    },
  };

  if (!serverId) {
    return profile;
  }

  const memberResult = await supabase
    .from("server_members")
    .select("user_id")
    .eq("server_id", serverId)
    .eq("user_id", targetUserId)
    .maybeSingle();
  const member = ensureNoError(memberResult, "Failed to verify target membership");
  if (!member) {
    return profile;
  }

  const [progressResult, rankListResult, rewardsCountResult] = await Promise.all([
    supabase
      .from("server_user_progress")
      .select("xp,points,level,tasks_completed")
      .eq("server_id", serverId)
      .eq("user_id", targetUserId)
      .maybeSingle(),
    supabase
      .from("server_user_progress")
      .select("user_id,xp")
      .eq("server_id", serverId)
      .order("xp", { ascending: false }),
    supabase
      .from("user_rewards")
      .select("id", { count: "exact", head: true })
      .eq("server_id", serverId)
      .eq("user_id", targetUserId),
  ]);

  const progress = ensureNoError(progressResult, "Failed to load profile progress");
  const rankList = ensureNoError(rankListResult, "Failed to load profile rank list");
  const rewardsCount = ensureNoError(rewardsCountResult, "Failed to load profile rewards count");

  const rankIndex = rankList.findIndex((entry) => entry.user_id === targetUserId);

  const level = progress?.level || levelFromXp(progress?.xp || 0);
  const xp = progress?.xp || 0;
  profile.stats = {
    level,
    xp,
    points: progress?.points || 0,
    tasksCompleted: progress?.tasks_completed || 0,
    trophiesUnlocked: rewardsCount?.length || rewardsCountResult.count || 0,
    rank: rankIndex >= 0 ? rankIndex + 1 : Math.max(1, rankList.length),
    xpToNext: xpToNextLevel(level),
  };

  return profile;
}

// ========== CALLS FUNCTIONS ==========

async function createCall(callData) {
  const result = await supabase
    .from("calls")
    .insert([callData])
    .select("id");
  const data = ensureNoError(result, "Failed to create call");
  return data[0].id;
}

async function getCallById(callId) {
  const result = await supabase
    .from("calls")
    .select("*")
    .eq("id", callId)
    .maybeSingle();
  const data = ensureNoError(result, "Failed to fetch call");
  return data;
}

async function addCallParticipant(callId, userId) {
  const result = await supabase.from("call_participants").insert([
    {
      call_id: callId,
      user_id: userId,
      joined_at: new Date(),
    },
  ]);
  ensureNoError(result, "Failed to add call participant");
}

async function updateParticipantLeaveTime(callId, userId) {
  const result = await supabase
    .from("call_participants")
    .update({
      left_at: new Date(),
    })
    .eq("call_id", callId)
    .eq("user_id", userId);
  ensureNoError(result, "Failed to update participant leave time");
}

async function endCall(callId, durationSeconds) {
  const result = await supabase
    .from("calls")
    .update({
      status: "ended",
      ended_at: new Date(),
      duration_seconds: durationSeconds,
    })
    .eq("id", callId);
  ensureNoError(result, "Failed to end call");
}

async function getCallParticipants(callId) {
  const result = await supabase
    .from("call_participants")
    .select("user_id, joined_at, left_at, duration_seconds")
    .eq("call_id", callId);
  const data = ensureNoError(result, "Failed to fetch call participants");
  return data || [];
}

async function getCallHistory(userId, limit = 20, offset = 0) {
  // Get calls where user was initiator or participant
  const participantResult = await supabase
    .from("call_participants")
    .select("call_id")
    .eq("user_id", userId);
  
  const participantIds = ensureNoError(participantResult, "Failed to fetch call participant records");
  const callIds = participantIds.map((p) => p.call_id);

  if (!callIds.length) return [];

  const result = await supabase
    .from("calls")
    .select("id, room_name, initiated_by, channel_id, call_type, status, started_at, ended_at, duration_seconds, created_at")
    .in("id", callIds)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  
  const calls = ensureNoError(result, "Failed to fetch call history");
  
  // Fetch initiator info for each call
  const initiatorIds = [...new Set(calls.map((c) => c.initiated_by))];
  const initiatorsResult = await supabase
    .from("users")
    .select("id, display_name, avatar")
    .in("id", initiatorIds);
  const initiators = ensureNoError(initiatorsResult, "Failed to fetch initiators");
  
  const initiatorMap = new Map(initiators.map((u) => [u.id, u]));
  
  return calls.map((call) => {
    const initiator = initiatorMap.get(call.initiated_by);
    return {
      ...call,
      initiator: {
        id: call.initiated_by,
        displayName: initiator?.display_name || "Unknown",
        avatar: initiator?.avatar || "",
      },
    };
  });
}

module.exports = {
  DEFAULT_SERVER_ID,
  DEFAULT_SERVER_NAME,
  ping,
  findUserById,
  findExistingByEmailOrUsername,
  createUser,
  ensureDefaultServerExists,
  ensureUserInDefaultServer,
  listServersForUser,
  discoverServersForUser,
  joinServer,
  createServer,
  updateServerSettings,
  listServerMembers,
  removeServerMember,
  listServerChannels,
  createServerChannel,
  deleteServerChannel,
  isServerMember,
  isServerAdmin,
  ensureDefaultChannelsForServer,
  compareUserPassword,
  setUserOnline,
  listOtherUsers,
  updateUserProfile,
  findChannelByNameAndTeam,
  findChannelById,
  createChannel,
  listChannels,
  canUserAccessChannel,
  listRecipientUserIdsForChannel,
  listDMChannelsForUser,
  findExistingDMChannel,
  createDMChannel,
  listMessages,
  createMessage,
  markChannelRead,
  getUnreadCountsForUser,
  listTasksForServer,
  createTask,
  updateTask,
  setTaskActive,
  deleteTask,
  completeTask,
  getServerProgress,
  listRewardsForAdmin,
  createReward,
  deleteReward,
  listRewardsForUser,
  redeemReward,
  getUserProfileOverview,
  // Call functions
  createCall,
  getCallById,
  addCallParticipant,
  updateParticipantLeaveTime,
  endCall,
  getCallParticipants,
  getCallHistory,
};
