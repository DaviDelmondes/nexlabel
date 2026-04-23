'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { resetPassword } from '@/app/actions/auth'

export default function ResetPasswordForm({ code }: { code: string }) {
  const [state, action, pending] = useActionState(resetPassword, null)

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-xl">
      <h2 className="text-xl font-semibold text-zinc-50 mb-1">Nova senha</h2>
      <p className="text-zinc-500 text-sm mb-6">Escolha uma nova senha para sua conta.</p>

      {state?.error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {state.error}{' '}
          {state.error.includes('expirado') && (
            <Link href="/forgot-password" className="underline font-medium">
              Solicitar novo link
            </Link>
          )}
        </div>
      )}

      <form action={action} className="space-y-4">
        <input type="hidden" name="code" value={code} />

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
          className="w-full py-2.5 px-4 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm transition-colors mt-2"
        >
          {pending ? 'Salvando...' : 'Salvar nova senha'}
        </button>
      </form>
    </div>
  )
}
