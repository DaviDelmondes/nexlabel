import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { signout } from '@/app/actions/auth'
import TrialBanner from '@/app/components/TrialBanner'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Busca perfil incluindo dados de trial
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan_status, trial_ends_at')
    .eq('id', user!.id)
    .single()

  // Verifica se o trial expirou (compara no servidor para precisão)
  const now = new Date()
  const trialEndsAt = profile?.trial_ends_at ? new Date(profile.trial_ends_at) : null
  const isTrialExpired =
    profile?.plan_status === 'trial' && (!trialEndsAt || trialEndsAt <= now)

  if (isTrialExpired) {
    // Atualiza o DB e redireciona para assinar
    await supabase.rpc('expire_trial_if_needed')
    redirect('/subscribe')
  }

  const status = profile?.plan_status ?? 'expired'
  const hasAccess = status === 'active' || status === 'trial' || status === 'pending'

  if (!hasAccess) {
    redirect('/subscribe')
  }

  const isOnActiveTrial = status === 'trial' && trialEndsAt && trialEndsAt > now

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-lg font-bold text-violet-400">
              Nexlabel
            </Link>
            <nav className="hidden sm:flex items-center gap-1">
              <Link
                href="/dashboard"
                className="px-3 py-1.5 rounded-lg text-sm text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/history"
                className="px-3 py-1.5 rounded-lg text-sm text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 transition-colors"
              >
                Histórico
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-xs text-zinc-500 truncate max-w-[180px]">
              {user?.email}
            </span>
            <form action={signout}>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg text-sm text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 transition-colors"
              >
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Banner de trial — aparece logo abaixo do header */}
      {isOnActiveTrial && (
        <TrialBanner trialEndsAt={trialEndsAt.toISOString()} />
      )}

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  )
}
