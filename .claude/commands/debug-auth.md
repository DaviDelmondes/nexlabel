# /debug-auth

Diagnóstico completo do fluxo de autenticação Supabase do Nexlabel.

Leia os arquivos abaixo e reporte problemas encontrados em cada área:

## 1. Server Actions (`app/actions/auth.ts`)

Verifique cada função:

- **`login`** — usa `signInWithPassword`, redireciona para `/dashboard`
- **`signup`** — usa `signUp` com `emailRedirectTo: undefined` (necessário para OTP), redireciona para `/verify-email` se `!email_confirmed_at`
- **`forgotPassword`** — usa `resetPasswordForEmail(email, { redirectTo })` com **um único email** do formulário. Não deve ter loop, forEach, SELECT em profiles sem filtro por `user.id`
- **`resetPassword`** — usa `exchangeCodeForSession(code)` + `updateUser({ password })`. Só afeta o usuário autenticado no momento
- **`verifyEmail`** — usa `verifyOtp({ email, token, type: 'signup' })`
- **`resendVerification`** — usa `resend({ type: 'signup', email })`

**Sinalizadores de risco:**
- Qualquer `for`, `forEach`, `.map()` que chame auth ou envie email
- SELECT em `profiles` sem `.eq('id', user.id)` ou `.eq('id', auth.uid())`
- Uso de `SUPABASE_SERVICE_ROLE_KEY` no client (só deve estar em API routes server-side)

## 2. Callback Route (`app/api/auth/callback/route.ts`)

Verifique:

- Lê `code`, `token_hash`, `type` e `next` de `searchParams`
- `successResponse` = `redirect(new URL(next, origin))` — deve apontar para o `?next=` da URL
- `errorResponse` = `redirect(new URL('/forgot-password', origin))`
- Fluxo PKCE (`?code=`): chama `exchangeCodeForSession(code)`
- Fluxo token_hash (`?token_hash=&type=`): chama `verifyOtp({ token_hash, type })`
- Se `verifyOtp` falhar → vai para `/forgot-password` (comportamento correto para link expirado/já usado)

**Causa mais comum de redirect errado para `/forgot-password`:**
O link no email usa `{{ .ConfirmationURL }}` em vez de `{{ .SiteURL }}/api/auth/callback?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password`. Verificar template no Supabase.

## 3. Templates de email (`templates/`)

Leia `templates/email-confirm.html` e `templates/email-reset-password.html`.

**Confirm signup** deve conter:
```
{{ .Token }}
```
exibido em destaque (código OTP de 6 dígitos). NÃO deve ter link de clique.

**Reset password** deve conter o link:
```
{{ .SiteURL }}/api/auth/callback?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password
```
NÃO deve usar `{{ .ConfirmationURL }}`.

## 4. Triggers do banco (`supabase/*.sql`)

Leia os arquivos SQL e liste todos os triggers definidos. Triggers legítimos neste projeto:

- `on_auth_user_created` em `auth.users` → `handle_new_user()` — apenas insere linha em `profiles`
- `expire_trial_if_needed()` — RPC, não trigger, só atualiza `plan_status` do usuário atual

Qualquer outro trigger em `auth.users` que chame funções de email é suspeito.

## 5. Variáveis de ambiente

Verifique se `.env.local` define:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL` — **crítico**: se ausente, `forgotPassword` usa `http://localhost:3000` como `redirectTo`, quebrando o reset em produção

## Relatório final

Ao terminar a leitura, produza um relatório com:

1. ✅ / ❌ para cada área verificada
2. Para cada ❌: arquivo, linha e descrição do problema
3. Ação corretiva específica (não genérica)
