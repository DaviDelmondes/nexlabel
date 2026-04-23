'use client'

import { useState } from 'react'
import PixCheckout from './PixCheckout'
import { fetchWithRetry } from '@/lib/fetchWithRetry'

type Plan = 'monthly' | 'annual'
type Method = 'card' | 'pix'

interface PixData {
  qrCode: string
  qrCodeBase64: string
  paymentId: number
}

const PLAN_LABELS: Record<Plan, string> = {
  annual:  'R$ 200,00/ano',
  monthly: 'R$ 20,00/mês',
}

export default function PlanSelector({ userId }: { userId: string }) {
  const [selected, setSelected] = useState<Plan>('annual')
  const [method, setMethod] = useState<Method>('card')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pixData, setPixData] = useState<PixData | null>(null)

  async function handleCardCheckout() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchWithRetry('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selected }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Erro ao iniciar pagamento'); return }
      window.location.href = data.init_point
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  async function handlePixCheckout() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchWithRetry('/api/pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selected }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Erro ao gerar Pix'); return }
      setPixData({ qrCode: data.qr_code, qrCodeBase64: data.qr_code_base64, paymentId: data.payment_id })
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (pixData) {
    return (
      <PixCheckout
        qrCode={pixData.qrCode}
        qrCodeBase64={pixData.qrCodeBase64}
        userId={userId}
        planLabel={PLAN_LABELS[selected]}
        onBack={() => setPixData(null)}
      />
    )
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
        <div className={['mt-4 flex items-center gap-2', selected === 'annual' ? 'opacity-100' : 'opacity-0'].join(' ')}>
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
        <div className={['mt-4 flex items-center gap-2', selected === 'monthly' ? 'opacity-100' : 'opacity-0'].join(' ')}>
          <div className="w-4 h-4 rounded-full bg-violet-500 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-white" />
          </div>
          <span className="text-xs text-violet-400 font-medium">Selecionado</span>
        </div>
      </button>

      {/* Forma de pagamento */}
      <div>
        <p className="text-xs text-zinc-500 mb-2">Forma de pagamento</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMethod('card')}
            className={[
              'flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all',
              method === 'card'
                ? 'border-violet-500 bg-violet-500/5 text-violet-300'
                : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600',
            ].join(' ')}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Cartão de crédito
          </button>
          <button
            type="button"
            onClick={() => setMethod('pix')}
            className={[
              'flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all',
              method === 'pix'
                ? 'border-violet-500 bg-violet-500/5 text-violet-300'
                : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600',
            ].join(' ')}
          >
            <PixIcon />
            Pix
          </button>
        </div>
      </div>

      {method === 'pix' && (
        <div className="px-3 py-2.5 rounded-lg bg-zinc-800/50 border border-zinc-800 text-xs text-zinc-500 flex items-start gap-2">
          <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Pagamento à vista. O plano é ativado automaticamente após a confirmação do Pix (geralmente em segundos).</span>
        </div>
      )}

      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={method === 'card' ? handleCardCheckout : handlePixCheckout}
        disabled={loading}
        className="w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors"
      >
        {loading
          ? (method === 'pix' ? 'Gerando Pix…' : 'Redirecionando…')
          : method === 'pix'
          ? `Gerar Pix — ${PLAN_LABELS[selected]}`
          : `Pagar com cartão — ${PLAN_LABELS[selected]}`}
      </button>

      <p className="text-center text-xs text-zinc-600">
        Pagamento seguro via Mercado Pago · Cancele quando quiser
      </p>
    </div>
  )
}

function PixIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9.17 14.83a1 1 0 000 1.41l2.83 2.83a1 1 0 001.41 0l2.83-2.83a1 1 0 000-1.41l-2.83-2.83a1 1 0 00-1.41 0l-2.83 2.83zm0-5.66l2.83-2.83a1 1 0 011.41 0l2.83 2.83a1 1 0 010 1.41l-2.83 2.83a1 1 0 01-1.41 0L9.17 10.58a1 1 0 010-1.41z" />
    </svg>
  )
}
