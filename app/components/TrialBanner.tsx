'use client'

import Link from 'next/link'

export default function TrialBanner({ trialEndsAt }: { trialEndsAt: string }) {
  const ends = new Date(trialEndsAt)
  const msLeft = ends.getTime() - Date.now()
  const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24))

  const isUrgent = daysLeft <= 2

  const label =
    daysLeft <= 0
      ? 'Seu trial expira hoje'
      : daysLeft === 1
      ? 'Falta 1 dia para o trial expirar'
      : `${daysLeft} dias restantes no trial gratuito`

  return (
    <div
      className={[
        'border-b px-4 py-2',
        isUrgent
          ? 'bg-red-500/10 border-red-500/20'
          : 'bg-amber-500/8 border-amber-500/20',
      ].join(' ')}
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          {isUrgent ? (
            <svg className="w-3.5 h-3.5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <span
            className={[
              'text-xs font-medium truncate',
              isUrgent ? 'text-red-300' : 'text-amber-300',
            ].join(' ')}
          >
            {label}
          </span>
        </div>

        <Link
          href="/subscribe"
          className={[
            'flex-shrink-0 px-3 py-1 rounded-lg text-xs font-semibold transition-colors',
            isUrgent
              ? 'bg-red-500 hover:bg-red-400 text-white'
              : 'bg-amber-500 hover:bg-amber-400 text-zinc-900',
          ].join(' ')}
        >
          Assinar agora
        </Link>
      </div>
    </div>
  )
}
