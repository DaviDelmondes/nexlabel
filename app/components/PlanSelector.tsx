'use client'

import { useState } from 'react'

type Plan = 'monthly' | 'annual'

export default function PlanSelector() {
  const [selected, setSelected] = useState<Plan>('annual')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCheckout() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selected }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Erro ao iniciar pagamento')
        return
      }
      window.location.href = data.init_point
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Plano Anual */}
      <button
        type="button"
        onClick={() => setSelected('annual')}
        className={[
          'w-full text-left rounded-2xl border-2 p-5 transition-all relative',
          selected === 'annual'
            ? 'border-violet-500 bg-violet-500/5'
            : 'border-zinc-700 bg-zinc-900 hover:border-zinc-600',
        ].join(' ')}
      >
        {/* Badge Recomendado */}
        <div className="absolute -top-3 left-4">
          <span className="px-3 py-0.5 rounded-full bg-violet-600 text-white text-xs font-semibold">
            Recomendado
          </span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base font-semibold text-zinc-50">Plano Anual</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 text-xs font-medium">
                Economize R$ 40,00
              </span>
            </div>
            <p className="text-sm text-zinc-500">Cobrança única de R$ 200,00 por ano</p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-2xl font-bold text-zinc-50">
              R$ 16<span className="text-base font-medium text-zinc-400">,67</span>
            </div>
            <div className="text-xs text-zinc-500">/mês</div>
          </div>
        </div>

        {/* Radio indicator */}
        <div className={[
          'mt-4 flex items-center gap-2',
          selected === 'annual' ? 'opacity-100' : 'opacity-0',
        ].join(' ')}>
          <div className="w-4 h-4 rounded-full bg-violet-500 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-white" />
          </div>
          <span className="text-xs text-violet-400 font-medium">Selecionado</span>
        </div>
      </button>

      {/* Plano Mensal */}
      <button
        type="button"
        onClick={() => setSelected('monthly')}
        className={[
          'w-full text-left rounded-2xl border-2 p-5 transition-all',
          selected === 'monthly'
            ? 'border-violet-500 bg-violet-500/5'
            : 'border-zinc-700 bg-zinc-900 hover:border-zinc-600',
        ].join(' ')}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-base font-semibold text-zinc-50 mb-1">Plano Mensal</p>
            <p className="text-sm text-zinc-500">Cobrança todo mês, cancele quando quiser</p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-2xl font-bold text-zinc-50">
              R$ 20<span className="text-base font-medium text-zinc-400">,00</span>
            </div>
            <div className="text-xs text-zinc-500">/mês</div>
          </div>
        </div>

        <div className={[
          'mt-4 flex items-center gap-2',
          selected === 'monthly' ? 'opacity-100' : 'opacity-0',
        ].join(' ')}>
          <div className="w-4 h-4 rounded-full bg-violet-500 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-white" />
          </div>
          <span className="text-xs text-violet-400 font-medium">Selecionado</span>
        </div>
      </button>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors"
      >
        {loading
          ? 'Redirecionando...'
          : selected === 'annual'
          ? 'Assinar por R$ 200,00/ano'
          : 'Assinar por R$ 20,00/mês'}
      </button>

      <p className="text-center text-xs text-zinc-600">
        Pagamento seguro via Mercado Pago · Cancele quando quiser
      </p>
    </div>
  )
}
