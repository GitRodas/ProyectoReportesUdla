-- Ejecutar en Supabase → SQL Editor (proyecto nuevo)

-- Perfiles de usuario (vinculados a Auth)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  nombre text not null,
  role text not null default 'usuario' check (role in ('usuario', 'administrador')),
  created_at timestamptz not null default now()
);

-- Incidentes reportados
create table if not exists public.incidents (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.profiles (id) on delete cascade,
  usuario_nombre text not null,
  tipo text not null,
  descripcion text not null,
  imagen_url text not null,
  ubicacion_texto text not null,
  latitud double precision,
  longitud double precision,
  fecha_creacion timestamptz not null default now(),
  estado text not null default 'reportado' check (estado in ('reportado', 'en_proceso', 'resuelto')),
  grupo_id text
);

create index if not exists incidents_fecha_creacion_idx on public.incidents (fecha_creacion desc);
create index if not exists incidents_grupo_id_idx on public.incidents (grupo_id);

alter table public.profiles enable row level security;
alter table public.incidents enable row level security;

-- ¿Es administrador?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'administrador'
  );
$$;

-- Perfiles
create policy "profiles_select"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id or public.is_admin());

create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- Incidentes
create policy "incidents_select"
  on public.incidents for select
  to authenticated
  using (true);

create policy "incidents_insert_own"
  on public.incidents for insert
  to authenticated
  with check (
    auth.uid() = usuario_id
    and estado = 'reportado'
  );

create policy "incidents_update_admin"
  on public.incidents for update
  to authenticated
  using (public.is_admin());

-- Crear perfil automáticamente al registrarse
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, nombre, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'nombre', split_part(new.email, '@', 1)),
    'usuario'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Storage: bucket público para fotos
insert into storage.buckets (id, name, public)
values ('incident-photos', 'incident-photos', true)
on conflict (id) do update set public = true;

create policy "incident_photos_select"
  on storage.objects for select
  to public
  using (bucket_id = 'incident-photos');

create policy "incident_photos_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'incident-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Tiempo real (opcional pero recomendado)
alter publication supabase_realtime add table public.incidents;
