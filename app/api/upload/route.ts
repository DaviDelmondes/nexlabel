import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import QRCode from 'qrcode'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
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

  const { data: savedProducts, error: productsError } = await supabase
    .from('products')
    .insert(products)
    .select('id, code, description, qr_data_url')

  if (productsError) {
    await supabase.from('uploads').delete().eq('id', upload.id)
    return NextResponse.json({ error: 'Erro ao salvar produtos' }, { status: 500 })
  }

  // Atualiza contagem real de produtos
  await supabase
    .from('uploads')
    .update({ product_count: products.length })
    .eq('id', upload.id)

  return NextResponse.json({
    upload: { id: upload.id, filename: upload.filename, product_count: products.length },
    products: savedProducts,
  })
}
