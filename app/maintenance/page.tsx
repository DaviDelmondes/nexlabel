export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        {/* Logo */}
        <div>
          <h1 className="text-3xl font-bold text-violet-400 tracking-tight">Nexlabel</h1>
        </div>

        {/* Icon */}
        <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto">
          <svg className="w-10 h-10 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-zinc-50">Sistema em manutenção</h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Estamos realizando melhorias para que sua experiência seja ainda melhor.
            Voltaremos em breve.
          </p>
        </div>

        {/* Animated dots */}
        <div className="flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-violet-500"
              style={{ animation: `pulse 1.5s ease-in-out ${i * 0.3}s infinite` }}
            />
          ))}
        </div>

        {/* Retry */}
        <form method="GET" action="/">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl border border-zinc-700 hover:border-zinc-600 text-zinc-300 hover:text-zinc-50 text-sm font-medium transition-colors"
          >
            Verificar disponibilidade
          </button>
        </form>
      </div>
    </div>
  )
}
