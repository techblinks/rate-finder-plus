-- Roles
create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null default 'user',
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create policy "Users view own roles"
  on public.user_roles for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Admins manage roles"
  on public.user_roles for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Site settings (single row)
create table public.site_settings (
  id int primary key default 1,
  logo_url text,
  favicon_url text,
  logo_height int not null default 32,
  updated_at timestamptz not null default now(),
  constraint single_row check (id = 1)
);

insert into public.site_settings (id) values (1);

alter table public.site_settings enable row level security;

create policy "Anyone can read site settings"
  on public.site_settings for select
  using (true);

create policy "Admins update site settings"
  on public.site_settings for update
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Storage bucket for branding assets
insert into storage.buckets (id, name, public)
values ('branding', 'branding', true);

create policy "Branding public read"
  on storage.objects for select
  using (bucket_id = 'branding');

create policy "Admins upload branding"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'branding' and public.has_role(auth.uid(), 'admin'));

create policy "Admins update branding"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'branding' and public.has_role(auth.uid(), 'admin'));

create policy "Admins delete branding"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'branding' and public.has_role(auth.uid(), 'admin'));