import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const MP_API = 'https://api.mercadopago.com'

// Mapeia status do MP para nosso plan_status
function mapStatus(mpStatus: string): 'active' | 'pending' | 'cancelled' | null {
  switch (mpStatus) {
    case 'authorized': return 'active'
    case 'pending':    return 'pending'
    case 'paused':
    case 'cancelled': return 'cancelled'
    default:           return null
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)

  if (!body || body.type !== 'subscription_preapproval') {
    return NextResponse.json({ received: true })
  }

  const subscriptionId = body.data?.id as string | undefined
  if (!subscriptionId) {
    return NextResponse.json({ received: true })
  }

  const token = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!token) {
    return NextResponse.json({ error: 'Token não configurado' }, { status: 500 })
  }

  // Busca detalhes da assinatura no MP para confirmar autenticidade
  const mpRes = await fetch(`${MP_API}/preapproval/${subscriptionId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!mpRes.ok) {
    return NextResponse.json({ error: 'Erro ao buscar assinatura' }, { status: 502 })
  }

  const subscription = await mpRes.json()
  const status = mapStatus(subscription.status)
  const externalReference = subscription.external_reference as string | undefined

  if (!status || !externalReference) {
    return NextResponse.json({ received: true })
  }

  // Determina o plano pelo valor cobrado
  const amount = subscription.auto_recurring?.transaction_amount
  const planType = amount >= 190 ? 'annual' : 'monthly'

  // Usa função security definer para atualizar sem service_role key
  const supabase = await createClient()
  await supabase.rpc('update_subscription_status', {
    p_external_reference: externalReference,
    p_subscription_id: subscriptionId,
    p_status: status,
    p_plan_type: planType,
  })

  return NextResponse.json({ received: true })
}
