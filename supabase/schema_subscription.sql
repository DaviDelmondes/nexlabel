-- =============================================
-- Nexlabel — Migração: Assinaturas
-- Execute no Supabase SQL Editor
-- =============================================

alter table public.profiles
  add column if not exists plan_status text
    check (plan_status in ('active', 'pending', 'cancelled'))
    default null,
  add column if not exists subscription_id text default null,
  add column if not exists plan_type text
    check (plan_type in ('monthly', 'annual'))
    default null;

-- Função SECURITY DEFINER para o webhook atualizar o status sem service_role key
create or replace function public.update_subscription_status(
  p_external_reference uuid,
  p_subscription_id text,
  p_status text,
  p_plan_type text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set
    plan_status    = p_status,
    subscription_id = p_subscription_id,
    plan_type      = coalesce(p_plan_type, plan_type)
  where id = p_external_reference;
end;
$$;

-- Permite que a anon key (usada pelo Route Handler do webhook) chame a função
grant execute on function public.update_subscription_status
  to anon, authenticated;
