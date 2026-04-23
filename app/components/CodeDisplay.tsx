'use client'

import { useState } from 'react'
import QRGrid from './QRGrid'
import BarcodeGrid from './BarcodeGrid'

type Product = {
  id: string
  code: string
  description: string | null
  qr_data_url: string
}

type Mode = 'qr' | 'barcode'

export default function CodeDisplay({ products }: { products: Product[] }) {
  const [mode, setMode] = useState<Mode>('qr')

  return (
    <div className="space-y-4">
      {/* Toggle QR / Código de Barras */}
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
