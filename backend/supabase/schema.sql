create extension if not exists pgcrypto;

create table if not exists public.servers (
  id text primary key,
  name text not null unique,
  description text not null default '',
  visibility text not null default 'public' check (visibility in ('public', 'private')),
  created_by uuid,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  display_name text not null check (char_length(display_name) <= 32),
  username text not null unique check (username ~ '^[a-z0-9_]+$'),
  email text not null unique,
  password_hash text not null,
  avatar text not null default '',
  bio text not null default '' check (char_length(bio) <= 200),
  favorite_team text not null default '',
  country text not null default '',
  city text not null default '',
  online boolean not null default false,
  last_seen timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.channels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null default 'text' check (type in ('text', 'voice', 'video', 'dm')),
  team text not null,
  description text not null default '',
  is_dm boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (name, team)
);

create table if not exists public.channel_members (
  channel_id uuid not null references public.channels(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (channel_id, user_id)
);

create table if not exists public.server_members (
  server_id text not null references public.servers(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role text not null default 'member' check (role in ('admin', 'member')),
  created_at timestamptz not null default now(),
  primary key (server_id, user_id)
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  server_id text not null references public.servers(id) on delete cascade,
  created_by uuid not null references public.users(id) on delete cascade,
  title text not null check (char_length(title) <= 80),
  description text not null,
  type text not null check (type in ('visit', 'photo', 'quiz', 'social', 'challenge')),
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard', 'legendary')),
  xp integer not null check (xp >= 10 and xp <= 10000),
  category text not null,
  location text,
  deadline text,
  badge text not null default '⭐',
  image text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.server_user_progress (
  server_id text not null references public.servers(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  xp integer not null default 0,
  points integer not null default 0,
  level integer not null default 1,
  tasks_completed integer not null default 0,
  last_task_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (server_id, user_id)
);

-- Rachas (streaks)
alter table public.server_user_progress
  add column if not exists current_streak integer not null default 0,
  add column if not exists max_streak integer not null default 0;

create table if not exists public.task_completions (
  server_id text not null references public.servers(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (task_id, user_id)
);

create table if not exists public.rewards_catalog (
  id uuid primary key default gen_random_uuid(),
  server_id text not null references public.servers(id) on delete cascade,
  name text not null,
  description text not null default '',
  cost_points integer not null check (cost_points >= 0),
  reward_type text not null default 'badge' check (reward_type in ('badge', 'title', 'item')),
  reward_value text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_rewards (
  id uuid primary key default gen_random_uuid(),
  server_id text not null references public.servers(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  reward_id uuid not null references public.rewards_catalog(id) on delete cascade,
  redeemed_at timestamptz not null default now()
);

-- Trofeos
create table if not exists public.trophies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  icon text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.user_trophies (
  user_id uuid not null references public.users(id) on delete cascade,
  trophy_id uuid not null references public.trophies(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, trophy_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  content text not null check (char_length(content) <= 2000),
  sender_id uuid not null references public.users(id) on delete cascade,
  channel_id uuid not null references public.channels(id) on delete cascade,
  type text not null default 'text' check (type in ('text', 'image', 'video', 'audio', 'file', 'system')),
  attachment_url text,
  attachment_path text,
  attachment_name text,
  attachment_size bigint,
  attachment_mime text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists public.messages
  add column if not exists attachment_url text,
  add column if not exists attachment_path text,
  add column if not exists attachment_name text,
  add column if not exists attachment_size bigint,
  add column if not exists attachment_mime text;

alter table if exists public.messages
  drop constraint if exists messages_type_check;

alter table if exists public.messages
  add constraint messages_type_check
  check (type in ('text', 'image', 'video', 'audio', 'file', 'system'));

create table if not exists public.channel_reads (
  channel_id uuid not null references public.channels(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  last_read_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (channel_id, user_id)
);

-- Insignias (badges)
create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  icon text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.user_badges (
  user_id uuid not null references public.users(id) on delete cascade,
  badge_id uuid not null references public.badges(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);

create index if not exists idx_messages_channel_created_at on public.messages (channel_id, created_at desc);
create index if not exists idx_channels_team on public.channels (team);
create index if not exists idx_channels_is_dm on public.channels (is_dm);
create index if not exists idx_server_members_user on public.server_members (user_id);
create index if not exists idx_tasks_server on public.tasks (server_id);
create index if not exists idx_progress_server_xp on public.server_user_progress (server_id, xp desc);
create index if not exists idx_task_completions_user on public.task_completions (user_id);
create index if not exists idx_rewards_catalog_server on public.rewards_catalog (server_id);
create index if not exists idx_user_rewards_server_user on public.user_rewards (server_id, user_id);
create index if not exists idx_channel_reads_user on public.channel_reads (user_id, channel_id);

-- Actividad reciente
create table if not exists public.user_activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  server_id text references public.servers(id) on delete cascade,
  type text not null, -- e.g. 'quiz_completed', 'photo_uploaded', 'level_up', 'trophy_unlocked', etc.
  description text not null,
  created_at timestamptz not null default now()
);

-- Llamadas de video
create table if not exists public.calls (
  id uuid primary key default gen_random_uuid(),
  room_name text not null unique,
  initiated_by uuid not null references public.users(id) on delete cascade,
  channel_id uuid references public.channels(id) on delete set null,
  call_type text not null check (call_type in ('direct', 'group')),
  status text not null default 'active' check (status in ('active', 'ended')),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_seconds integer,
  created_at timestamptz not null default now()
);

-- Participantes de llamadas
create table if not exists public.call_participants (
  id uuid primary key default gen_random_uuid(),
  call_id uuid not null references public.calls(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  duration_seconds integer,
  created_at timestamptz not null default now(),
  unique (call_id, user_id)
);

-- Índices para performance
create index if not exists idx_calls_initiated_by on public.calls (initiated_by);
create index if not exists idx_calls_channel_id on public.calls (channel_id);
create index if not exists idx_calls_status on public.calls (status);
create index if not exists idx_call_participants_user on public.call_participants (user_id);
create index if not exists idx_call_participants_call on public.call_participants (call_id);

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_users_updated_at on public.users;
create trigger trg_users_updated_at
before update on public.users
for each row execute function public.handle_updated_at();

drop trigger if exists trg_channels_updated_at on public.channels;
create trigger trg_channels_updated_at
before update on public.channels
for each row execute function public.handle_updated_at();

drop trigger if exists trg_messages_updated_at on public.messages;
create trigger trg_messages_updated_at
before update on public.messages
for each row execute function public.handle_updated_at();

drop trigger if exists trg_servers_updated_at on public.servers;
create trigger trg_servers_updated_at
before update on public.servers
for each row execute function public.handle_updated_at();

drop trigger if exists trg_tasks_updated_at on public.tasks;
create trigger trg_tasks_updated_at
before update on public.tasks
for each row execute function public.handle_updated_at();

drop trigger if exists trg_progress_updated_at on public.server_user_progress;
create trigger trg_progress_updated_at
before update on public.server_user_progress
for each row execute function public.handle_updated_at();

drop trigger if exists trg_rewards_catalog_updated_at on public.rewards_catalog;
create trigger trg_rewards_catalog_updated_at
before update on public.rewards_catalog
for each row execute function public.handle_updated_at();

drop trigger if exists trg_channel_reads_updated_at on public.channel_reads;
create trigger trg_channel_reads_updated_at
before update on public.channel_reads
for each row execute function public.handle_updated_at();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'chat-media',
  'chat-media',
  true,
  52428800,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm',
    'audio/mpeg',
    'audio/ogg',
    'audio/wav',
    'application/pdf',
    'text/plain',
    'application/zip'
  ]
)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;
