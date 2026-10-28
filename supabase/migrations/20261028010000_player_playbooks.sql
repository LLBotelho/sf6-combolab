-- ComboLab: account allowlist plus per-player playbooks.
-- Each of the four invited players must be approved by the administrator
-- after Supabase Auth creates their user. No public registration is exposed by the UI.
create table if not exists public.allowed_players (
  user_id uuid primary key references auth.users(id) on delete cascade,
  approved_at timestamptz not null default now()
);

create table if not exists public.user_playbooks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{"version":1,"mains":[],"combos":[]}'::jsonb,
  revision bigint not null default 0 check (revision >= 0),
  updated_at timestamptz not null default now(),
  constraint playbook_valid_shape check (
    jsonb_typeof(data) = 'object'
    and data->>'version' = '1'
    and jsonb_typeof(data->'mains') = 'array'
    and jsonb_typeof(data->'combos') = 'array'
    and pg_column_size(data) <= 10485760
  )
);

alter table public.allowed_players enable row level security;
alter table public.user_playbooks enable row level security;
revoke all on table public.allowed_players from public, anon, authenticated;
revoke all on table public.user_playbooks from public, anon, authenticated;
grant select on table public.allowed_players to authenticated;
grant select, insert, update on table public.user_playbooks to authenticated;

create policy "Only see own approval" on public.allowed_players
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "Read own approved playbook" on public.user_playbooks
  for select to authenticated
  using (user_id = (select auth.uid()) and exists (
    select 1 from public.allowed_players ap where ap.user_id = (select auth.uid())
  ));
create policy "Create own approved playbook" on public.user_playbooks
  for insert to authenticated
  with check (user_id = (select auth.uid()) and exists (
    select 1 from public.allowed_players ap where ap.user_id = (select auth.uid())
  ));
create policy "Update own approved playbook" on public.user_playbooks
  for update to authenticated
  using (user_id = (select auth.uid()) and exists (
    select 1 from public.allowed_players ap where ap.user_id = (select auth.uid())
  ))
  with check (user_id = (select auth.uid()) and exists (
    select 1 from public.allowed_players ap where ap.user_id = (select auth.uid())
  ));

-- Prevent exposure of passwords or service credentials: auth.users stays in auth schema.
-- No DELETE or TRUNCATE is granted to the browser clients.
