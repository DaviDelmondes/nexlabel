-- =============================================
-- Nexlabel - Schema do banco de dados Supabase
-- Execute este SQL no Supabase SQL Editor
-- =============================================

-- Tabela de perfis (espelho de auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  plan_status text default 'inactive' not null, -- 'inactive' | 'pending' | 'active' | 'cancelled'
  plan_type text default 'monthly' not null,    -- 'monthly' | 'annual'
  subscription_id text,
  created_at timestamptz default now() not null
);

-- Tabela de uploads de planilha
create table if not exists public.uploads (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  filename text not null,
  product_count integer default 0 not null,
  created_at timestamptz default now() not null
);

-- Tabela de produtos extraídos da planilha
create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  upload_id uuid references public.uploads(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  code text not null,
  description text,
  qr_data_url text not null,
  created_at timestamptz default now() not null
);

-- =============================================
-- Row Level Security (RLS)
-- =============================================

alter table public.profiles enable row level security;
alter table public.uploads enable row level security;
alter table public.products enable row level security;

-- Políticas para profiles
create policy "Usuário vê próprio perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Usuário atualiza próprio perfil"
  on public.profiles for update
  using (auth.uid() = id);

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
-- Trigger: cria perfil automaticamente no signup
-- =============================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================
-- Função RPC: atualiza status da assinatura via webhook do Mercado Pago
-- (security definer permite rodar sem service_role key)
-- =============================================

create or replace function public.update_subscription_status(
  p_external_reference uuid,
  p_subscription_id text,
  p_status text,
  p_plan_type text
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

-- Política para o trigger inserir perfis (necessário para handle_new_user)
create policy "Sistema cria perfil no signup"
  on public.profiles for insert
  with check (true);
