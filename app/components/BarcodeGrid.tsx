'use client'

import { useEffect, useRef, useState } from 'react'

type Product = { id: string; code: string; description: string | null }

function BarcodeCard({ product }: { product: Product }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      // bwip-js/browser usa `export =` incompatível com typed dynamic import — cast é seguro aqui
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const bwipjs = (await import('bwip-js/browser')) as any
      if (cancelled || !canvasRef.current) return
      try {
        bwipjs.toCanvas(canvasRef.current, {
          bcid: 'code128',
          text: product.code,
          scale: 3,
          height: 10,
          includetext: true,
          textxalign: 'center',
          backgroundcolor: 'ffffff',
        })
        if (!cancelled) setReady(true)
      } catch {
        if (!cancelled) setError(true)
      }
    })()
    return () => { cancelled = true }
  }, [product.code])

  function download() {
    if (!canvasRef.current) return
    const link = document.createElement('a')
    link.href = canvasRef.current.toDataURL('image/png')
    link.download = `barcode-${product.code}.png`
    link.click()
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex flex-col items-center gap-2 hover:border-zinc-700 transition-colors group">
      <div className="bg-white rounded-lg p-2 w-full flex items-center justify-center min-h-[72px]">
        {error ? (
          <p className="text-red-400 text-xs">Código inválido</p>
        ) : (
          <canvas
            ref={canvasRef}
            className={['max-w-full transition-opacity', ready ? 'opacity-100' : 'opacity-0'].join(' ')}
          />
        )}
      </div>
      <div className="text-center min-w-0 w-full">
        <p className="text-xs font-mono font-semibold text-zinc-200 truncate">{product.code}</p>
        {product.description && (
          <p className="text-xs text-zinc-500 truncate mt-0.5">{product.description}</p>
        )}
      </div>
      <button
        onClick={download}
        disabled={!ready}
        className="w-full py-1.5 rounded-lg bg-zinc-800 hover:bg-violet-600 text-zinc-400 hover:text-white text-xs font-medium transition-colors opacity-0 group-hover:opacity-100 disabled:cursor-not-allowed"
      >
        Baixar
      </button>
    </div>
  )
}

export default function BarcodeGrid({ products }: { products: Product[] }) {
  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? products.filter(
        (p) =>
          p.code.toLowerCase().includes(search.toLowerCase()) ||
          p.description?.toLowerCase().includes(search.toLowerCase())
      )
    : products

  async function downloadAll() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bwipjs = (await import('bwip-js/browser')) as any
    for (const product of products) {
      const canvas = document.createElement('canvas')
      try {
        bwipjs.toCanvas(canvas, {
          bcid: 'code128',
          text: product.code,
          scale: 3,
          height: 10,
          includetext: true,
          textxalign: 'center',
          backgroundcolor: 'ffffff',
        })
        const link = document.createElement('a')
        link.href = canvas.toDataURL('image/png')
        link.download = `barcode-${product.code}.png`
        link.click()
        // pequeno delay para o browser não bloquear múltiplos downloads
        await new Promise((r) => setTimeout(r, 80))
      } catch {
        // ignora códigos inválidos no download em massa
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <input
          type="search"
          placeholder="Filtrar por código ou descrição..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-64 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-50 placeholder-zinc-600 focus:outline-none focus:border-violet-500 text-sm"
        />
        <button
          onClick={downloadAll}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-sm font-medium transition-colors whitespace-nowrap"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Baixar todos
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="text-zinc-500 text-sm text-center py-8">Nenhum produto encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filtered.map((product) => (
            <BarcodeCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
