import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import QRCode from 'qrcode'
import { createClient } from '@/lib/supabase/server'

const PREVIEW_SIZE = 200

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  // PROBLEMA 3 FIX: trial com trial_ends_at null (conta antes da migração)
  // também tem acesso. Bloqueia apenas plan_status = 'expired'.
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan_status, trial_ends_at')
    .eq('id', user.id)
    .single()

  const trialEndsAt = profile?.trial_ends_at ? new Date(profile.trial_ends_at) : null
  const hasAccess =
    profile?.plan_status === 'active' ||
    profile?.plan_status === 'pending' ||
    (profile?.plan_status === 'trial' && (!trialEndsAt || trialEndsAt > new Date()))

  if (!hasAccess) {
    return NextResponse.json(
      { error: 'Seu trial expirou. Assine um plano para continuar fazendo uploads.' },
      { status: 403 }
    )
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'Arquivo não enviado' }, { status: 400 })
  }

  const ext = file.name.split('.').pop()?.toLowerCase()
  if (!ext || !['xlsx', 'xls', 'csv'].includes(ext)) {
    return NextResponse.json({ error: 'Formato inválido. Use .xlsx, .xls ou .csv' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' })

  if (rows.length === 0) {
    return NextResponse.json({ error: 'Planilha está vazia' }, { status: 400 })
  }

  // Detecta colunas de código e descrição (case-insensitive)
  const firstRow = rows[0]
  const keys = Object.keys(firstRow)

  const codeKey = keys.find(k =>
    /^(cod|code|codigo|código|sku|ref|referencia|referência|id)$/i.test(k)
  ) ?? keys[0]

  const descKey = keys.find(k =>
    /^(desc|descricao|descrição|description|nome|name|produto|product)$/i.test(k)
  )

  // Cria registro de upload
  const { data: upload, error: uploadError } = await supabase
    .from('uploads')
    .insert({
      user_id: user.id,
      filename: file.name,
      product_count: rows.length,
    })
    .select()
    .single()

  if (uploadError || !upload) {
    return NextResponse.json({ error: 'Erro ao salvar upload' }, { status: 500 })
  }

  // Processa produtos e gera QR codes
  const products: Array<{
    upload_id: string
    user_id: string
    code: string
    description: string | null
    qr_data_url: string
  }> = []

  for (const row of rows) {
    const code = String(row[codeKey] ?? '').trim()
    if (!code) continue

    const description = descKey ? String(row[descKey] ?? '').trim() || null : null

    const qrDataUrl = await QRCode.toDataURL(code, {
      width: 200,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    })

    products.push({ upload_id: upload.id, user_id: user.id, code, description, qr_data_url: qrDataUrl })
  }

  if (products.length === 0) {
    await supabase.from('uploads').delete().eq('id', upload.id)
    return NextResponse.json({ error: 'Nenhum código válido encontrado na planilha' }, { status: 400 })
  }

  // PROBLEMA 2 FIX: insert separado do select para evitar o limite padrão de 1000 linhas
  // do Supabase no insert().select()
  const { error: productsError } = await supabase
    .from('products')
    .insert(products)

  if (productsError) {
    await supabase.from('uploads').delete().eq('id', upload.id)
    return NextResponse.json({ error: 'Erro ao salvar produtos' }, { status: 500 })
  }

  // Atualiza contagem real
  await supabase
    .from('uploads')
    .update({ product_count: products.length })
    .eq('id', upload.id)

  // Retorna preview dos primeiros PREVIEW_SIZE produtos
  // O cliente pode carregar mais via Load More usando o uploadId
  const { data: preview } = await supabase
    .from('products')
    .select('id, code, description, qr_data_url')
    .eq('upload_id', upload.id)
    .order('created_at', { ascending: true })
    .range(0, PREVIEW_SIZE - 1)

  return NextResponse.json({
    upload: { id: upload.id, filename: upload.filename, product_count: products.length },
    products: preview ?? [],
  })
}
