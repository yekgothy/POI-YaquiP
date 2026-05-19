insert into public.servers (id, name, description, visibility, is_default)
values ('world-cup-hub', 'World Cup Hub', 'Servidor oficial de la comunidad World Cup Hub', 'public', true)
on conflict (id) do update set name = excluded.name, is_default = true;

insert into public.channels (name, type, team, description, is_dm)
values
  ('general', 'text', 'world-cup-hub', '', false),
  ('anuncios', 'text', 'world-cup-hub', '', false),
  ('sala-voz', 'voice', 'world-cup-hub', '', false)
on conflict (name, team) do nothing;
