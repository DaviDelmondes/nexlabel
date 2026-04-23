'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Nexlabel dashboard error]', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center space-y-5">
      <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center">
        <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      </div>
      <div>
        <h2 className="text-lg font-semibold text-zinc-50">Erro ao carregar página</h2>
        <p className="text-zinc-500 text-sm mt-1">
          Não foi possível carregar os dados. Verifique sua conexão e tente novamente.
        </p>
        {error.digest && (
          <p className="text-zinc-700 text-xs font-mono mt-2">Ref: {error.digest}</p>
        )}
      </div>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors"
        >
          Tentar novamente
        </button>
        <Link
          href="/dashboard"
          className="px-5 py-2 rounded-xl border border-zinc-700 hover:border-zinc-600 text-zinc-300 text-sm font-semibold transition-colors"
        >
          Dashboard
        </Link>
      </div>
    </div>
  )
}
