'use client'

import { useState } from 'react'

type Product = {
  id: string
  code: string
  description: string | null
  qr_data_url: string
}

export default function QRGrid({ products }: { products: Product[] }) {
  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? products.filter(
        (p) =>
          p.code.toLowerCase().includes(search.toLowerCase()) ||
          p.description?.toLowerCase().includes(search.toLowerCase())
      )
    : products

  function downloadAll() {
    products.forEach((p) => {
      const link = document.createElement('a')
      link.href = p.qr_data_url
      link.download = `qr-${p.code}.png`
      link.click()
    })
  }

  function downloadOne(product: Product) {
    const link = document.createElement('a')
    link.href = product.qr_data_url
    link.download = `qr-${product.code}.png`
    link.click()
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex flex-col items-center gap-2 hover:border-zinc-700 transition-colors group"
            >
              <div className="bg-white rounded-lg p-1.5">
                <img
                  src={product.qr_data_url}
                  alt={`QR Code ${product.code}`}
                  width={120}
                  height={120}
                  className="w-full max-w-[120px] aspect-square"
                />
              </div>
              <div className="text-center min-w-0 w-full">
                <p className="text-xs font-mono font-semibold text-zinc-200 truncate">{product.code}</p>
                {product.description && (
                  <p className="text-xs text-zinc-500 truncate mt-0.5">{product.description}</p>
                )}
              </div>
              <button
                onClick={() => downloadOne(product)}
                className="w-full py-1.5 rounded-lg bg-zinc-800 hover:bg-violet-600 text-zinc-400 hover:text-white text-xs font-medium transition-colors opacity-0 group-hover:opacity-100"
              >
                Baixar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
