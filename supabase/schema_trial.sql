-- =============================================
-- Nexlabel - Migração: Sistema de Trial de 7 dias
-- + Fix: constraint profiles_plan_status_check
--
-- Execute no Supabase SQL Editor.
-- Seguro para rodar múltiplas vezes (idempotente).
-- =============================================


-- ── Passo 1: Remover constraint antiga ───────────────────
-- A constraint original não incluía 'trial' nem 'expired'.
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_plan_status_check;


-- ── Passo 2: Adicionar coluna trial_ends_at ──────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz;


-- ── Passo 3: Nova constraint com todos os valores ────────
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_plan_status_check
  CHECK (plan_status IN (
    'trial',
    'active',
    'pending',
    'expired',
    'cancelled',
    'inactive'
  ));


-- ── Passo 4: Atualizar default do plan_status ────────────
ALTER TABLE public.profiles
  ALTER COLUMN plan_status SET DEFAULT 'trial';


-- ── Passo 5: Corrigir contas existentes sem trial ────────
-- Usuários já cadastrados (inactive, pending, etc.)
-- recebem 7 dias de trial a partir de agora.
-- Assinantes ativos (active) não são afetados.
UPDATE public.profiles
SET
  plan_status   = 'trial',
  trial_ends_at = now() + interval '7 days'
WHERE plan_status NOT IN ('active')
   OR plan_status IS NULL;


-- ── Passo 6: Recriar handle_new_user com trial ───────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, plan_status, trial_ends_at)
  VALUES (
    new.id,
    new.email,
    'trial',
    now() + interval '7 days'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ── Passo 7: Recriar expire_trial_if_needed ──────────────
CREATE OR REPLACE FUNCTION public.expire_trial_if_needed()
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET plan_status = 'expired'
  WHERE id            = auth.uid()
    AND plan_status   = 'trial'
    AND trial_ends_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =============================================
-- VERIFICAÇÃO — rode após os passos acima
-- =============================================

-- 1. Confirmar a nova constraint:
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'public.profiles'::regclass
  AND contype = 'c';

-- Resultado esperado:
-- profiles_plan_status_check | CHECK (plan_status IN ('trial','active',...))


-- 2. Confirmar colunas da tabela:
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'profiles'
ORDER BY ordinal_position;


-- 3. Ver usuários e seus status:
SELECT id, email, plan_status, trial_ends_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 10;
