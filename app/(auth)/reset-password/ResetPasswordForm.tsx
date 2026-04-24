'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Status = 'loading' | 'ready' | 'invalid'

export default function ResetPasswordForm() {
  const router = useRouter()
  const [status, setStatus] = useState<Status>('loading')
  const [formError, setFormError] = useState<string | null>(null)
  const [confirmError, setConfirmError] = useState<string | null>(null)
  const [invalidReason, setInvalidReason] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    async function init() {
      // ── Caso 1: Fluxo PKCE ───────────────────────────────────────────────
      // O /api/auth/callback já fez exchangeCodeForSession e gravou a sessão
      // nos cookies. O browser client consegue lê-la direto.
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setStatus('ready')
        return
      }

      // ── Caso 2: Fluxo implícito ──────────────────────────────────────────
      // O Supabase redirecionou com #access_token=xxx na URL.
      // O hash NÃO é enviado ao servidor, mas está disponível no browser.
      const hash = window.location.hash.slice(1) // remove o "#"
      if (!hash) {
        setInvalidReason('Link inválido ou sem token. Solicite um novo.')
        setStatus('invalid')
        return
      }

      const params = new URLSearchParams(hash)
      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token') ?? ''
      const type = params.get('type')

      if (!accessToken || type !== 'recovery') {
        setInvalidReason('Link inválido para redefinição de senha.')
        setStatus('invalid')
        return
      }

      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })

      if (error) {
        setInvalidReason('Link expirado. Solicite um novo link de redefinição.')
        setStatus('invalid')
      } else {
        setStatus('ready')
      }
    }

    init()
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError(null)
    setConfirmError(null)

    const form = e.currentTarget
    const password = (form.elements.namedItem('password') as HTMLInputElement).value
    const confirm  = (form.elements.namedItem('confirm')  as HTMLInputElement).value

    if (password !== confirm) {
      setConfirmError('As senhas não coincidem')
      return
    }

    setPending(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setFormError(error.message)
      setPending(false)
      return
    }

    // Encerra a sessão de recovery para que o usuário faça login normalmente
    await supabase.auth.signOut()
    router.push('/login?reset=true')
  }

  // ── Verificando ────────────────────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-xl flex items-center justify-center gap-3 min-h-[160px]">
        <div className="w-5 h-5 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-zinc-500 text-sm">Verificando link...</span>
      </div>
    )
  }

  // ── Link inválido / expirado ───────────────────────────────────────────────
  if (status === 'invalid') {
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
            {invalidReason ?? 'Solicite um novo link de redefinição de senha.'}
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

  // ── Formulário ─────────────────────────────────────────────────────────────
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-xl">
      <h2 className="text-xl font-semibold text-zinc-50 mb-1">Nova senha</h2>
      <p className="text-zinc-500 text-sm mb-6">Escolha uma nova senha para sua conta.</p>

      {formError && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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
            onChange={() => setConfirmError(null)}
            className="w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-50 placeholder-zinc-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors text-sm"
          />
        </div>

        <div>
          <label htmlFor="confirm" className="block text-sm font-medium text-zinc-300 mb-1.5">
            Confirmar nova senha
          </label>
          <input
            id="confirm"
            name="confirm"
            type="password"
            required
            autoComplete="new-password"
            placeholder="Repita a nova senha"
            minLength={6}
            onChange={() => setConfirmError(null)}
            className={[
              'w-full px-4 py-2.5 rounded-lg bg-zinc-800 border text-zinc-50 placeholder-zinc-600 focus:outline-none focus:ring-1 transition-colors text-sm',
              confirmError
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-zinc-700 focus:border-violet-500 focus:ring-violet-500',
            ].join(' ')}
          />
          {confirmError && (
            <p className="mt-1.5 text-xs text-red-400">{confirmError}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full py-2.5 px-4 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm transition-colors"
        >
          {pending ? 'Salvando...' : 'Salvar nova senha'}
        </button>
      </form>
    </div>
  )
}
