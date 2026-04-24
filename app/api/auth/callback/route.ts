import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * Rota de callback unificada do Supabase Auth.
 *
 * Suporta três fluxos:
 *   1. PKCE  — ?code=xxx             (ConfirmationURL via Supabase verify endpoint)
 *   2. Hash  — ?token_hash=xxx&type= (link direto do template de email com {{ .TokenHash }})
 *   3. Impl  — sem params             (browser preserva #access_token= no redirect HTTP)
 *
 * Cria o NextResponse ANTES de chamar o Supabase para que os cookies
 * de sessão sejam gravados diretamente no objeto de resposta (padrão SSR).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code      = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type      = searchParams.get('type')
  const next      = searchParams.get('next') ?? '/dashboard'

  // Cria a resposta de redirect antes, para poder gravar cookies nela
  const successResponse = NextResponse.redirect(new URL(next, origin))
  const errorResponse   = NextResponse.redirect(new URL('/forgot-password', origin))

  // Cliente Supabase que escreve cookies no objeto de resposta (não em next/headers)
  function makeClient(response: NextResponse) {
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )
  }

  // ── Fluxo 1: PKCE (?code=) ───────────────────────────────────────────────
  if (code) {
    const supabase = makeClient(successResponse)
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error('[auth/callback] PKCE:', error.message)
      return errorResponse
    }
    return successResponse
  }

  // ── Fluxo 2: token_hash (?token_hash=&type=) ─────────────────────────────
  // Usado pelo template de email que contém {{ .TokenHash }} diretamente.
  // Não passa pelo endpoint de verificação do Supabase, então não precisa
  // de Allowed Redirect URLs — o app verifica o token localmente.
  if (tokenHash && type) {
    const supabase = makeClient(successResponse)
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as 'recovery' | 'signup' | 'email' | 'invite' | 'magiclink' | 'email_change',
    })
    if (error) {
      console.error('[auth/callback] token_hash:', error.message)
      return errorResponse
    }
    return successResponse
  }

  // ── Fluxo 3: implícito ───────────────────────────────────────────────────
  // O browser preserva o #access_token= do redirect HTTP (spec HTML5).
  // O ResetPasswordForm.tsx lê o hash e chama setSession() no client.
  return successResponse
}
