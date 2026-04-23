'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  qrCode: string
  qrCodeBase64: string
  userId: string
  planLabel: string
  onBack: () => void
}

export default function PixCheckout({ qrCode, qrCodeBase64, userId, planLabel, onBack }: Props) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  const imgSrc = qrCodeBase64.startsWith('data:')
    ? qrCodeBase64
    : `data:image/png;base64,${qrCodeBase64}`

  // Polling a cada 3s para detectar pagamento aprovado
  useEffect(() => {
    const supabase = createClient()
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from('profiles')
        .select('plan_status')
        .eq('id', userId)
        .single()
      if (data?.plan_status === 'active') {
        clearInterval(interval)
        setConfirmed(true)
        setTimeout(() => router.push('/dashboard'), 2500)
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [userId, router])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(qrCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // fallback para browsers sem clipboard API
      const el = document.createElement('textarea')
      el.value = qrCode
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  if (confirmed) {
    return (
      <div className="text-center space-y-4 py-6">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-zinc-50">Pagamento confirmado!</h3>
          <p className="text-zinc-500 text-sm mt-1">Seu plano foi ativado. Redirecionando…</p>
        </div>
        <div className="flex justify-center">
          <div className="w-5 h-5 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="text-center">
        <p className="text-sm text-zinc-400">
          Pague <span className="font-semibold text-zinc-50">{planLabel}</span> via Pix
        </p>
        <p className="text-xs text-zinc-600 mt-0.5">Escaneie o QR code ou copie o código</p>
      </div>

      {/* QR Code */}
      <div className="flex justify-center">
        <div className="bg-white p-3 rounded-2xl inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imgSrc} alt="QR Code Pix" width={192} height={192} className="block" />
        </div>
      </div>

      {/* Copia e cola */}
      <div>
        <p className="text-xs text-zinc-500 mb-2 text-center">Pix copia e cola</p>
        <div className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5">
          <p className="text-xs text-zinc-400 flex-1 truncate font-mono">{qrCode}</p>
          <button
            type="button"
            onClick={handleCopy}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition-colors"
          >
            {copied ? (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Copiado!
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copiar
              </>
            )}
          </button>
        </div>
      </div>

      {/* Status aguardando */}
      <div className="flex items-center justify-center gap-2 py-2">
        <div className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-zinc-500">Aguardando pagamento…</span>
      </div>

      <button
        type="button"
        onClick={onBack}
        className="w-full py-2.5 rounded-xl border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 text-sm transition-colors"
      >
        Voltar
      </button>
    </div>
  )
}
