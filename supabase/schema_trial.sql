-- =============================================
-- Nexlabel - Migração: Sistema de Trial de 7 dias
-- Execute no Supabase SQL Editor SE já tiver
-- rodado o schema.sql anterior (sem trial).
-- Seguro para rodar múltiplas vezes (idempotente).
-- =============================================

-- 1. Adiciona coluna trial_ends_at (se não existir)
alter table public.profiles
  add column if not exists trial_ends_at timestamptz;

-- 2. Muda o default de novas linhas
alter table public.profiles
  alter column plan_status set default 'trial';

-- 3. PROBLEMA 1 — Contas antigas sem plano ativo recebem trial de 7 dias a partir de agora
--    Afeta: 'inactive', 'pending', 'cancelled', 'expired', NULL
--    NÃO afeta: plan_status = 'active' (assinantes pagos ficam como estão)
update public.profiles
set
  plan_status   = 'trial',
  trial_ends_at = now() + interval '7 days'
where plan_status not in ('active')
   or plan_status is null;

-- 4. Atualiza trigger para novos signups receberem trial automaticamente
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

-- 5. Cria (ou recria) a função que expira trials vencidos
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
-- Verificação: veja o resultado após rodar
-- =============================================
-- select id, email, plan_status, trial_ends_at from profiles order by created_at desc limit 20;
