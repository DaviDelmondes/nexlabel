'use client'

import { useEffect, useRef, useState } from 'react'
import QRGrid from './QRGrid'
import BarcodeGrid from './BarcodeGrid'
import { createClient } from '@/lib/supabase/client'

type Product = {
  id: string
  code: string
  description: string | null
  qr_data_url: string
}

type Mode = 'qr' | 'barcode'

interface Props {
  products: Product[]
  uploadId?: string
  total?: number
}

export default function CodeDisplay({ products: initial, uploadId, total = initial.length }: Props) {
  const [mode, setMode] = useState<Mode>('qr')
  const [products, setProducts] = useState<Product[]>(initial)
  const [loadingAll, setLoadingAll] = useState(!!uploadId && initial.length < total)
  const [loadedCount, setLoadedCount] = useState(initial.length)
  // ref evita problemas de stale closure no loop de fetch
  const accRef = useRef<Product[]>(initial)

  useEffect(() => {
    if (!uploadId || initial.length >= total) return

    let cancelled = false
    setLoadingAll(true)

    async function fetchAll() {
      const supabase = createClient()

      while (accRef.current.length < total && !cancelled) {
        const from = accRef.current.length
        const to = from + 999

        const { data } = await supabase
          .from('products')
          .select('id, code, description, qr_data_url')
          .eq('upload_id', uploadId!)
          .order('created_at', { ascending: true })
          .range(from, to)

        if (cancelled) return
        if (!data || data.length === 0) break

        accRef.current = [...accRef.current, ...data]
        setLoadedCount(accRef.current.length)
      }

      if (!cancelled) {
        setProducts(accRef.current)
        setLoadingAll(false)
      }
    }

    fetchAll()
    return () => { cancelled = true }
  }, [uploadId, total, initial.length])

  // ── Spinner enquanto carrega todos ─────────────────────────────────────────
  if (loadingAll) {
    const pct = total > 0 ? Math.round((loadedCount / total) * 100) : 0
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-5">
        <div className="relative w-14 h-14">
          <div className="w-14 h-14 border-[3px] border-zinc-800 rounded-full" />
          <div className="absolute inset-0 w-14 h-14 border-[3px] border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-zinc-300 text-sm font-medium">Carregando produtos...</p>
          <p className="text-zinc-500 text-xs">
            {loadedCount.toLocaleString('pt-BR')} de {total.toLocaleString('pt-BR')} ({pct}%)
          </p>
        </div>
      </div>
    )
  }

  // ── Grid com toggle ────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <div className="flex bg-zinc-800/60 border border-zinc-700/50 rounded-xl p-1 w-fit gap-1">
        <button
          type="button"
          onClick={() => setMode('qr')}
          className={[
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
            mode === 'qr'
              ? 'bg-zinc-700 text-zinc-50 shadow-sm'
              : 'text-zinc-500 hover:text-zinc-300',
          ].join(' ')}
        >
          <QRIcon />
          QR Code
        </button>
        <button
          type="button"
          onClick={() => setMode('barcode')}
          className={[
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
            mode === 'barcode'
              ? 'bg-zinc-700 text-zinc-50 shadow-sm'
              : 'text-zinc-500 hover:text-zinc-300',
          ].join(' ')}
        >
          <BarcodeIcon />
          Código de Barras
        </button>
      </div>

      {mode === 'qr' ? (
        <QRGrid products={products} />
      ) : (
        <BarcodeGrid products={products} />
      )}
    </div>
  )
}

function QRIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12v.01M12 4h.01M4 4h4v4H4V4zm12 0h4v4h-4V4zM4 16h4v4H4v-4z" />
    </svg>
  )
}

function BarcodeIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h1v12H4V6zm3 0h1v12H7V6zm3 0h2v12h-2V6zm4 0h1v12h-1V6zm3 0h2v12h-2V6z" />
    </svg>
  )
}
