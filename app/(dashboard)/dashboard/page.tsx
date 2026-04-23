import { createClient } from '@/lib/supabase/server'
import UploadSection from '@/app/components/UploadSection'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [{ data: { user } }, { data: recentUploads }] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from('uploads')
      .select('id, filename, product_count, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan_status, trial_ends_at')
    .eq('id', user!.id)
    .single()

  // Trial ativo OU assinatura paga → pode usar o app
  const trialEndsAt = profile?.trial_ends_at ? new Date(profile.trial_ends_at) : null
  const hasActiveSubscription =
    profile?.plan_status === 'active' ||
    (profile?.plan_status === 'trial' && !!trialEndsAt && trialEndsAt > new Date())

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-50">Dashboard</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Faça upload de uma planilha Excel para gerar QR codes
        </p>
      </div>

      <UploadSection hasActiveSubscription={hasActiveSubscription} />

      {recentUploads && recentUploads.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-zinc-300 mb-3">Uploads recentes</h2>
          <div className="space-y-2">
            {recentUploads.map((upload) => (
              <a
                key={upload.id}
                href={`/history/${upload.id}`}
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-200 truncate">{upload.filename}</p>
                    <p className="text-xs text-zinc-500">
                      {upload.product_count} produto{upload.product_count !== 1 ? 's' : ''} •{' '}
                      {new Date(upload.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <svg className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
