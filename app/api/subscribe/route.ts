import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const MP_API = 'https://api.mercadopago.com'

const PLANS = {
  monthly: {
    reason: 'Nexlabel — Plano Mensal',
    frequency: 1,
    frequency_type: 'months',
    transaction_amount: 20.00,
  },
  annual: {
    reason: 'Nexlabel — Plano Anual',
    frequency: 12,
    frequency_type: 'months',
    transaction_amount: 200.00,
  },
} as const

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const body = await request.json()
  const plan = body.plan as 'monthly' | 'annual'

  if (!PLANS[plan]) {
    return NextResponse.json({ error: 'Plano inválido' }, { status: 400 })
  }

  const token = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!token) {
    return NextResponse.json({ error: 'Token Mercado Pago não configurado' }, { status: 500 })
  }

  // VERCEL_URL é injetado automaticamente pela Vercel em produção
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  const config = PLANS[plan]

  const mpResponse = await fetch(`${MP_API}/preapproval`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      reason: config.reason,
      external_reference: user.id,
      payer_email: user.email,
      auto_recurring: {
        frequency: config.frequency,
        frequency_type: config.frequency_type,
        transaction_amount: config.transaction_amount,
        currency_id: 'BRL',
      },
      back_url: `${appUrl}/subscribe?success=true`,
      notification_url: `${appUrl}/api/webhooks/mercadopago`,
      status: 'pending',
    }),
  })

  if (!mpResponse.ok) {
    const err = await mpResponse.json().catch(() => ({}))
    console.error('[MP subscribe] error:', err)
    return NextResponse.json(
      { error: 'Erro ao criar assinatura no Mercado Pago' },
      { status: 502 }
    )
  }

  const data = await mpResponse.json()

  // Salva subscription_id e plano no perfil (status ainda 'pending' até webhook confirmar)
  await supabase
    .from('profiles')
    .update({ subscription_id: data.id, plan_type: plan, plan_status: 'pending' })
    .eq('id', user.id)

  return NextResponse.json({ init_point: data.init_point })
}
