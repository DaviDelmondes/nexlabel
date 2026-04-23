import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Rota de callback do Supabase Auth.
 * - Fluxo PKCE:     recebe ?code=xxx → troca por sessão → redireciona para ?next
 * - Fluxo implícito: sem ?code, só redireciona para ?next
 *   (o navegador preserva o #access_token= no redirect HTTP conforme spec HTML5)
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error('[auth/callback]', error.message)
      return NextResponse.redirect(new URL('/forgot-password', origin))
    }
  }

  return NextResponse.redirect(new URL(next, origin))
}
