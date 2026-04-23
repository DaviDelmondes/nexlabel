'use client'

import { useEffect } from 'react'
import Link from 'next/link'

function isConnectivityError(error: Error) {
  const msg = error.message.toLowerCase()
  return (
    msg.includes('fetch failed') ||
    msg.includes('failed to fetch') ||
    msg.includes('network') ||
    msg.includes('econnrefused') ||
    msg.includes('enotfound') ||
    msg.includes('timeout') ||
    msg.includes('connection')
  )
}

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Nexlabel error]', error)
  }, [error])

  const isMaintenance = isConnectivityError(error)

  if (isMaintenance) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-zinc-950">
        <div className="text-center space-y-5 max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-50">Sistema em manutenção</h1>
            <p className="text-zinc-500 text-sm mt-2">
              Estamos com instabilidade temporária. Por favor, aguarde alguns instantes e tente novamente.
            </p>
          </div>
          <button
            onClick={reset}
            className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors"
          >
            Tentar novamente
          </button>
          <p className="text-zinc-700 text-xs">
            Se o problema persistir, entre em contato com o suporte.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-zinc-950">
      <div className="text-center space-y-5 max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-50">Algo deu errado</h1>
          <p className="text-zinc-500 text-sm mt-2">
            Ocorreu um erro inesperado. Tente novamente ou volte ao início.
          </p>
          {error.digest && (
            <p className="text-zinc-700 text-xs font-mono mt-2">Ref: {error.digest}</p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors"
          >
            Tentar novamente
          </button>
          <Link
            href="/dashboard"
            className="px-6 py-2.5 rounded-xl border border-zinc-700 hover:border-zinc-600 text-zinc-300 text-sm font-semibold transition-colors"
          >
            Ir ao dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
