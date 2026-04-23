import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const MP_API = 'https://api.mercadopago.com'

const PLANS = {
  monthly: { description: 'Nexlabel — Plano Mensal', amount: 20.00 },
  annual:  { description: 'Nexlabel — Plano Anual',  amount: 200.00 },
} as const

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await request.json()
  const plan = body.plan as 'monthly' | 'annual'

  if (!PLANS[plan]) return NextResponse.json({ error: 'Plano inválido' }, { status: 400 })

  const token = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!token) return NextResponse.json({ error: 'Token não configurado' }, { status: 500 })

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

  const config = PLANS[plan]

  const mpResponse = await fetch(`${MP_API}/v1/payments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-Idempotency-Key': `pix-${user.id}-${plan}-${Date.now()}`,
    },
    body: JSON.stringify({
      transaction_amount: config.amount,
      description: config.description,
      payment_method_id: 'pix',
      payer: { email: user.email },
      external_reference: user.id,
      notification_url: `${appUrl}/api/webhooks/mercadopago`,
    }),
  })

  if (!mpResponse.ok) {
    const err = await mpResponse.json().catch(() => ({}))
    console.error('[MP pix] error:', err)
    return NextResponse.json({ error: 'Erro ao gerar cobrança Pix' }, { status: 502 })
  }

  const data = await mpResponse.json()
  const txData = data.point_of_interaction?.transaction_data

  // Registra o pagamento pendente no perfil
  await supabase
    .from('profiles')
    .update({ subscription_id: String(data.id), plan_type: plan, plan_status: 'pending' })
    .eq('id', user.id)

  return NextResponse.json({
    payment_id: data.id,
    qr_code: txData?.qr_code,
    qr_code_base64: txData?.qr_code_base64,
  })
}
