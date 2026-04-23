import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const MP_API = 'https://api.mercadopago.com'

function mapSubscriptionStatus(s: string): 'active' | 'pending' | 'cancelled' | null {
  switch (s) {
    case 'authorized': return 'active'
    case 'pending':    return 'pending'
    case 'paused':
    case 'cancelled':  return 'cancelled'
    default:           return null
  }
}

function mapPaymentStatus(s: string): 'active' | 'pending' | 'cancelled' | null {
  switch (s) {
    case 'approved':      return 'active'
    case 'pending':
    case 'in_process':    return 'pending'
    case 'rejected':
    case 'cancelled':
    case 'refunded':
    case 'charged_back':  return 'cancelled'
    default:              return null
  }
}

async function handleSubscription(subscriptionId: string, token: string) {
  const mpRes = await fetch(`${MP_API}/preapproval/${subscriptionId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!mpRes.ok) return NextResponse.json({ error: 'Erro ao buscar assinatura' }, { status: 502 })

  const subscription = await mpRes.json()
  const status = mapSubscriptionStatus(subscription.status)
  const externalReference = subscription.external_reference as string | undefined
  if (!status || !externalReference) return NextResponse.json({ received: true })

  const amount = subscription.auto_recurring?.transaction_amount
  const planType = amount >= 190 ? 'annual' : 'monthly'

  const supabase = await createClient()
  await supabase.rpc('update_subscription_status', {
    p_external_reference: externalReference,
    p_subscription_id: subscriptionId,
    p_status: status,
    p_plan_type: planType,
  })

  return NextResponse.json({ received: true })
}

async function handlePayment(paymentId: string, token: string) {
  const mpRes = await fetch(`${MP_API}/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!mpRes.ok) return NextResponse.json({ error: 'Erro ao buscar pagamento' }, { status: 502 })

  const payment = await mpRes.json()

  // Só processa pagamentos Pix
  if (payment.payment_method_id !== 'pix') return NextResponse.json({ received: true })

  const status = mapPaymentStatus(payment.status)
  const externalReference = payment.external_reference as string | undefined
  if (!status || !externalReference) return NextResponse.json({ received: true })

  const planType = payment.transaction_amount >= 190 ? 'annual' : 'monthly'

  const supabase = await createClient()
  await supabase.rpc('update_subscription_status', {
    p_external_reference: externalReference,
    p_subscription_id: String(payment.id),
    p_status: status,
    p_plan_type: planType,
  })

  return NextResponse.json({ received: true })
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ received: true })

  const token = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!token) return NextResponse.json({ error: 'Token não configurado' }, { status: 500 })

  if (body.type === 'payment' && body.data?.id) {
    return handlePayment(String(body.data.id), token)
  }

  if (body.type === 'subscription_preapproval' && body.data?.id) {
    return handleSubscription(String(body.data.id), token)
  }

  return NextResponse.json({ received: true })
}
