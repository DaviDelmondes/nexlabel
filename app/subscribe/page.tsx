import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { signout } from '@/app/actions/auth'
import PlanSelector from '@/app/components/PlanSelector'

export default async function SubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan_status, plan_type, subscription_id')
    .eq('id', user.id)
    .single()

  const { success } = await searchParams

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header mínimo */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-lg font-bold text-violet-400">Nexlabel</span>
          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-xs text-zinc-600 truncate max-w-[200px]">{user.email}</span>
            <form action={signout}>
              <button type="submit" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">

          {/* Assinatura ativa */}
          {profile?.plan_status === 'active' ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto">
                <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-zinc-50">Sua assinatura está ativa</h1>
              <p className="text-zinc-500 text-sm">
                Plano {profile.plan_type === 'annual' ? 'Anual' : 'Mensal'} ativo.
                Aproveite todos os recursos do Nexlabel.
              </p>
              <Link
                href="/dashboard"
                className="inline-block mt-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors"
              >
                Ir ao dashboard
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Aguardando confirmação do pagamento */}
              {success === 'true' && (
                <div className="px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm text-center">
                  Pagamento recebido! Aguardando confirmação do Mercado Pago (pode levar alguns minutos).
                </div>
              )}

              <div className="text-center">
                <h1 className="text-2xl font-bold text-zinc-50">Escolha seu plano</h1>
                <p className="text-zinc-500 text-sm mt-2">
                  Acesso completo a todos os recursos do Nexlabel
                </p>
              </div>

              {/* Benefícios */}
              <ul className="space-y-2">
                {[
                  'Upload ilimitado de planilhas Excel',
                  'Geração de QR codes em massa',
                  'Histórico completo de uploads',
                  'Download dos QR codes em PNG',
                ].map((benefit) => (
                  <li key={benefit} className="flex items-center gap-2.5 text-sm text-zinc-400">
                    <svg className="w-4 h-4 text-violet-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {benefit}
                  </li>
                ))}
              </ul>

              {/* Seletor de planos */}
              <PlanSelector userId={user.id} />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
