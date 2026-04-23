import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CodeDisplay from '@/app/components/CodeDisplay'

const PAGE_SIZE = 200

export default async function UploadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()

  const { data: upload } = await supabase
    .from('uploads')
    .select('id, filename, product_count, created_at')
    .eq('id', id)
    .single()

  if (!upload) notFound()

  // PROBLEMA 2 FIX: busca paginada com count exato
  // Supabase limita 1000 linhas por padrão — usamos range() explícito
  const { data: products, count } = await supabase
    .from('products')
    .select('id, code, description, qr_data_url', { count: 'exact' })
    .eq('upload_id', id)
    .order('created_at', { ascending: true })
    .range(0, PAGE_SIZE - 1)

  // Usa product_count do upload como fallback se count não vier
  const total = count ?? upload.product_count

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/history"
          className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-zinc-50 truncate">{upload.filename}</h1>
          <p className="text-zinc-500 text-xs mt-0.5">
            {total.toLocaleString('pt-BR')} produto{total !== 1 ? 's' : ''} •{' '}
            {new Date(upload.created_at).toLocaleString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>

      {products && products.length > 0 ? (
        <CodeDisplay
          products={products}
          uploadId={id}
          total={total}
        />
      ) : (
        <p className="text-zinc-500 text-sm text-center py-12">Nenhum produto neste upload.</p>
      )}
    </div>
  )
}
