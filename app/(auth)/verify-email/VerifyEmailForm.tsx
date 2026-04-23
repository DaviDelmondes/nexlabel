'use client'

import { useActionState, useRef, useState } from 'react'
import Link from 'next/link'
import { verifyEmail, resendVerification } from '@/app/actions/auth'

function OTPInput({ name }: { name: string }) {
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const refs = useRef<(HTMLInputElement | null)[]>([])

  function handleChange(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = digit
    setDigits(next)
    if (digit && index < 5) refs.current[index + 1]?.focus()
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!text) return
    e.preventDefault()
    const next = text.split('').concat(Array(6).fill('')).slice(0, 6)
    setDigits(next)
    refs.current[Math.min(text.length, 5)]?.focus()
  }

  return (
    <div className="flex gap-2 justify-center">
      <input type="hidden" name={name} value={digits.join('')} />
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="w-11 h-14 text-center text-xl font-bold rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-50 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
        />
      ))}
    </div>
  )
}

export default function VerifyEmailForm({ email }: { email: string }) {
  const [state, action, pending] = useActionState(verifyEmail, null)
  const [resendState, resendAction, resendPending] = useActionState(resendVerification, null)

  const maskedEmail = email.replace(/(.{2})(.+?)(@.+)$/, (_, a, b, c) => a + '*'.repeat(b.length) + c)

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-xl">
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-zinc-50 mb-1">Verifique seu e-mail</h2>
        <p className="text-zinc-500 text-sm">
          Enviamos um código de 6 dígitos para{' '}
          <span className="text-zinc-300 font-medium">{maskedEmail}</span>
        </p>
      </div>

      {state?.error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
          {state.error}
        </div>
      )}

      <form action={action} className="space-y-6">
        <input type="hidden" name="email" value={email} />
        <OTPInput name="token" />

        <button
          type="submit"
          disabled={pending}
          className="w-full py-2.5 px-4 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm transition-colors"
        >
          {pending ? 'Verificando...' : 'Confirmar e-mail'}
        </button>
      </form>

      <div className="mt-5 text-center space-y-2">
        {resendState && 'sent' in resendState ? (
          <p className="text-emerald-400 text-sm">Código reenviado! Verifique sua caixa de entrada.</p>
        ) : (
          <>
            {resendState && 'error' in resendState && (
              <p className="text-red-400 text-sm">{resendState.error}</p>
            )}
            <form action={resendAction}>
              <input type="hidden" name="email" value={email} />
              <button
                type="submit"
                disabled={resendPending}
                className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-50"
              >
                {resendPending ? 'Reenviando...' : 'Não recebeu? Reenviar código'}
              </button>
            </form>
          </>
        )}
        <div>
          <Link href="/signup" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
            Usar outro e-mail
          </Link>
        </div>
      </div>
    </div>
  )
}
