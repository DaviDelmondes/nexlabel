-- =============================================
-- Nexlabel - Schema do banco de dados Supabase
-- Execute este SQL no Supabase SQL Editor
-- =============================================

-- Tabela de perfis (espelho de auth.users)
create table if not exists public.profiles (
  id            uuid references auth.users on delete cascade primary key,
  email         text,
  plan_status   text default 'trial' not null,
  -- 'trial' | 'active' | 'pending' | 'expired' | 'cancelled'
  plan_type     text default 'monthly' not null,   -- 'monthly' | 'annual'
  subscription_id text,
  trial_ends_at timestamptz default (now() + interval '7 days'),
  created_at    timestamptz default now() not null
);

-- Tabela de uploads de planilha
create table if not exists public.uploads (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references public.profiles(id) on delete cascade not null,
  filename      text not null,
  product_count integer default 0 not null,
  created_at    timestamptz default now() not null
);

-- Tabela de produtos extraídos da planilha
create table if not exists public.products (
  id          uuid default gen_random_uuid() primary key,
  upload_id   uuid references public.uploads(id) on delete cascade not null,
  user_id     uuid references public.profiles(id) on delete cascade not null,
  code        text not null,
  description text,
  qr_data_url text not null,
  created_at  timestamptz default now() not null
);

-- =============================================
-- Row Level Security (RLS)
-- =============================================

alter table public.profiles enable row level security;
alter table public.uploads   enable row level security;
alter table public.products  enable row level security;

-- Políticas para profiles
create policy "Usuário vê próprio perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Usuário atualiza próprio perfil"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Sistema cria perfil no signup"
  on public.profiles for insert
  with check (true);

-- Políticas para uploads
create policy "Usuário vê próprios uploads"
  on public.uploads for select
  using (auth.uid() = user_id);

create policy "Usuário cria uploads"
  on public.uploads for insert
  with check (auth.uid() = user_id);

create policy "Usuário deleta próprios uploads"
  on public.uploads for delete
  using (auth.uid() = user_id);

-- Políticas para products
create policy "Usuário vê próprios produtos"
  on public.products for select
  using (auth.uid() = user_id);

create policy "Usuário cria produtos"
  on public.products for insert
  with check (auth.uid() = user_id);

create policy "Usuário deleta próprios produtos"
  on public.products for delete
  using (auth.uid() = user_id);

-- =============================================
-- Trigger: cria perfil com trial ao fazer signup
-- =============================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, plan_status, trial_ends_at)
  values (
    new.id,
    new.email,
    'trial',
    now() + interval '7 days'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================
-- RPC: expira trial automaticamente se vencido
-- Usada pelo dashboard layout a cada acesso
-- =============================================

create or replace function public.expire_trial_if_needed()
returns void as $$
begin
  update public.profiles
  set plan_status = 'expired'
  where id            = auth.uid()
    and plan_status   = 'trial'
    and trial_ends_at < now();
end;
$$ language plpgsql security definer;

-- =============================================
-- RPC: atualiza status via webhook do Mercado Pago
-- =============================================

create or replace function public.update_subscription_status(
  p_external_reference uuid,
  p_subscription_id    text,
  p_status             text,
  p_plan_type          text
)
returns void as $$
begin
  update public.profiles
  set
    subscription_id = p_subscription_id,
    plan_status     = p_status,
    plan_type       = p_plan_type
  where id = p_external_reference;
end;
$$ language plpgsql security definer;
