'use client'

import { useEffect, useState, useActionState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { resetPassword } from '@/app/actions/auth'
import { createClient } from '@/lib/supabase/client'

// Fluxo PKCE  → Supabase envia ?code=xxx na URL (query string)
// Fluxo implícito → Supabase envia #access_token=xxx no hash da URL
type Flow = 'detecting' | 'code' | 'hash' | 'invalid'

interface Props {
  /** Presente quando Supabase usou fluxo PKCE (?code=) */
  code?: string
}

export default function ResetPasswordForm({ code }: Props) {
  const router = useRouter()

  // --- Fluxo PKCE (server action) ---
  const [codeState, codeAction, codePending] = useActionState(resetPassword, null)

  // --- Fluxo implícito (hash) ---
  const [flow, setFlow] = useState<Flow>(code ? 'code' : 'detecting')
  const [hashError, setHashError] = useState<string | null>(null)
  const [hashPending, setHashPending] = useState(false)

  useEffect(() => {
    if (code) return // PKCE já detectado no server, skip

    const raw = window.location.hash.slice(1) // remove o "#"
    if (!raw) {
      setFlow('invalid')
      return
    }

    const params = new URLSearchParams(raw)
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token') ?? ''
    const type = params.get('type')

    if (!accessToken || type !== 'recovery') {
      setFlow('invalid')
      return
    }

    // Estabelece a sessão com os tokens do hash
    const supabase = createClient()
    supabase.auth
      .setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error }) => {
        if (error) {
          setHashError('Link inválido ou expirado. Solicite um novo.')
          setFlow('invalid')
        } else {
          setFlow('hash')
        }
      })
  }, [code])

  async function handleHashSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setHashPending(true)
    setHashError(null)

    const password = (new FormData(e.currentTarget)).get('password') as string
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setHashError(error.message)
      setHashPending(false)
    } else {
      await supabase.auth.signOut()
      router.push('/login?reset=true')
    }
  }

  // ── Detectando tipo de fluxo ──────────────────────────────────────────────
  if (flow === 'detecting') {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-xl flex items-center justify-center gap-3 min-h-[160px]">
        <div className="w-5 h-5 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-zinc-500 text-sm">Verificando link...</span>
      </div>
    )
  }

  // ── Link inválido / expirado ───────────────────────────────────────────────
  if (flow === 'invalid') {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-xl text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto">
          <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-zinc-50">Link inválido ou expirado</h2>
          <p className="text-zinc-500 text-sm mt-1">
            {hashError ?? 'Solicite um novo link de redefinição de senha.'}
          </p>
        </div>
        <Link
          href="/forgot-password"
          className="inline-block px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors"
        >
          Solicitar novo link
        </Link>
      </div>
    )
  }

  // ── Formulário compartilhado (PKCE ou hash) ────────────────────────────────
  const error = flow === 'code' ? codeState?.error : hashError
  const pending = flow === 'code' ? codePending : hashPending

  const fields = (
    <div className="space-y-4">
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-1.5">
          Nova senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          placeholder="Mínimo 6 caracteres"
          minLength={6}
          className="w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-50 placeholder-zinc-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full py-2.5 px-4 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm transition-colors"
      >
        {pending ? 'Salvando...' : 'Salvar nova senha'}
      </button>
    </div>
  )

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-xl">
      <h2 className="text-xl font-semibold text-zinc-50 mb-1">Nova senha</h2>
      <p className="text-zinc-500 text-sm mb-6">Escolha uma nova senha para sua conta.</p>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}{' '}
          {error.includes('expirado') && (
            <Link href="/forgot-password" className="underline font-medium">
              Solicitar novo link
            </Link>
          )}
        </div>
      )}

      {flow === 'code' ? (
        <form action={codeAction}>
          <input type="hidden" name="code" value={code} />
          {fields}
        </form>
      ) : (
        <form onSubmit={handleHashSubmit}>
          {fields}
        </form>
      )}
    </div>
  )
}
