'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import QRGrid from './QRGrid'

type Product = {
  id: string
  code: string
  description: string | null
  qr_data_url: string
}

type UploadResult = {
  upload: { id: string; filename: string; product_count: number }
  products: Product[]
}

type Props = { hasActiveSubscription: boolean }

export default function UploadSection({ hasActiveSubscription }: Props) {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<UploadResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Gate de assinatura
  if (!hasActiveSubscription) {
    return (
      <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 px-8 py-10 text-center">
        <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-zinc-50 mb-1">Recurso exclusivo para assinantes</h3>
        <p className="text-sm text-zinc-500 mb-5">
          Assine o Nexlabel para fazer upload de planilhas e gerar QR codes em massa.
        </p>
        <Link
          href="/subscribe"
          className="inline-block px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors"
        >
          Ver planos e assinar
        </Link>
      </div>
    )
  }

  async function processFile(file: File) {
    setError(null)
    setResult(null)
    setUploading(true)

    const form = new FormData()
    form.append('file', file)

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Erro ao processar arquivo')
      } else {
        setResult(data)
      }
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setUploading(false)
    }
  }

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return
    processFile(files[0])
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }, [])

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }

  const onDragLeave = () => setDragging(false)

  return (
    <div className="space-y-6">
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => !uploading && inputRef.current?.click()}
        className={[
          'relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all',
          dragging
            ? 'border-violet-500 bg-violet-500/5'
            : 'border-zinc-700 hover:border-zinc-600 bg-zinc-900/50',
          uploading ? 'opacity-60 cursor-not-allowed' : '',
        ].join(' ')}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={uploading}
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-zinc-400 text-sm font-medium">Processando planilha...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <p className="text-zinc-200 font-medium text-sm">
                Arraste sua planilha aqui ou clique para selecionar
              </p>
              <p className="text-zinc-500 text-xs mt-1">
                Suporta .xlsx, .xls e .csv — a primeira coluna deve conter os códigos dos produtos
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-200">{result.upload.filename}</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                {result.upload.product_count} QR code{result.upload.product_count !== 1 ? 's' : ''} gerado{result.upload.product_count !== 1 ? 's' : ''}
              </p>
            </div>
            <a href={`/history/${result.upload.id}`} className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
              Ver detalhes →
            </a>
          </div>
          <QRGrid products={result.products} />
        </div>
      )}
    </div>
  )
}
