'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { signup } from '@/app/actions/auth'

export default function SignupPage() {
  const [state, action, pending] = useActionState(signup, null)
  const [confirmError, setConfirmError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const form = e.currentTarget
    const password = (form.elements.namedItem('password') as HTMLInputElement).value
    const confirm  = (form.elements.namedItem('confirm')  as HTMLInputElement).value

    if (password !== confirm) {
      e.preventDefault()
      setConfirmError('As senhas não coincidem')
      return
    }

    setConfirmError(null)
    // Senhas iguais → deixa o Server Action prosseguir normalmente
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-xl">
      <h2 className="text-xl font-semibold text-zinc-50 mb-1">Criar conta</h2>
      <p className="text-zinc-500 text-sm mb-6">Comece a gerar QR codes agora</p>

      {state?.error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {state.error}
        </div>
      )}

      <form action={action} onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-1.5">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="seu@email.com"
            className="w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-50 placeholder-zinc-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors text-sm"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-1.5">
            Senha
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
            Confirmar senha
          </label>
          <input
            id="confirm"
            name="confirm"
            type="password"
            required
            autoComplete="new-password"
            placeholder="Repita a senha"
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
          className="w-full py-2.5 px-4 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm transition-colors mt-2"
        >
          {pending ? 'Criando conta...' : 'Criar conta'}
        </button>
      </form>

      <p className="text-center text-zinc-500 text-sm mt-6">
        Já tem conta?{' '}
        <Link href="/login" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
          Entrar
        </Link>
      </p>
    </div>
  )
}
