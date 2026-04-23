import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold text-violet-400 tracking-tight">Nexlabel</span>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:text-zinc-50 hover:bg-zinc-800 transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-colors"
            >
              Cadastrar
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden py-24 sm:py-32 px-4 text-center">
        {/* Background decorativo */}
        <div className="absolute inset-0 bg-gradient-to-b from-violet-950/25 via-transparent to-transparent pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #a78bfa 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            Geração de QR codes em massa
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-zinc-50 leading-tight tracking-tight mb-6">
            Do Excel ao QR code{' '}
            <span className="text-violet-400">em segundos</span>
          </h1>

          <p className="text-lg sm:text-xl text-zinc-400 leading-relaxed mb-10 max-w-2xl mx-auto">
            Faça upload da sua planilha, selecione os produtos e gere centenas de QR codes prontos para impressão. Perfeito para etiquetas industriais e controle de estoque.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-colors shadow-lg shadow-violet-500/20"
            >
              Criar conta grátis
            </Link>
            <a
              href="#como-funciona"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/50 text-zinc-300 font-medium text-sm transition-colors"
            >
              Ver como funciona
            </a>
          </div>
        </div>

        {/* Mockup visual */}
        <div className="relative max-w-2xl mx-auto mt-16">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-2xl shadow-black/40 backdrop-blur">
            {/* Barra de título fake */}
            <div className="flex items-center gap-2 mb-5 pb-4 border-b border-zinc-800">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-zinc-700" />
                <div className="w-3 h-3 rounded-full bg-zinc-700" />
                <div className="w-3 h-3 rounded-full bg-zinc-700" />
              </div>
              <div className="flex-1 h-5 rounded bg-zinc-800 mx-4 max-w-xs" />
            </div>
            {/* Grid de QR codes fake */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-lg bg-zinc-800 flex items-center justify-center">
                  <div className="w-8 h-8 grid grid-cols-3 gap-0.5">
                    {Array.from({ length: 9 }).map((_, j) => (
                      <div
                        key={j}
                        className={`rounded-sm ${Math.random() > 0.5 ? 'bg-violet-400/60' : 'bg-zinc-700'}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-zinc-600">
              <span>produtos.xlsx · 12 QR codes gerados</span>
              <span className="text-violet-500">✓ Pronto</span>
            </div>
          </div>
          {/* Glow */}
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-t from-violet-500/10 to-transparent pointer-events-none" />
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="py-20 px-4 border-t border-zinc-800/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-zinc-50 mb-3">Como funciona</h2>
            <p className="text-zinc-500">Três passos simples do upload ao QR code pronto</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                ),
                title: 'Faça upload da planilha',
                desc: 'Arraste ou selecione sua planilha Excel ou CSV. A primeira coluna deve conter os códigos dos produtos.',
              },
              {
                step: '02',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: 'QR codes gerados automaticamente',
                desc: 'O sistema processa cada linha da planilha e gera um QR code único por produto, instantaneamente.',
              },
              {
                step: '03',
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                ),
                title: 'Baixe e use nas etiquetas',
                desc: 'Baixe todos os QR codes em PNG com um clique. Filtre por código ou descrição antes de exportar.',
              },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="relative bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-colors">
                <div className="absolute top-5 right-5 text-4xl font-bold text-zinc-800 select-none">
                  {step}
                </div>
                <div className="w-11 h-11 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center mb-4">
                  {icon}
                </div>
                <h3 className="text-base font-semibold text-zinc-50 mb-2">{title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PREÇOS */}
      <section id="precos" className="py-20 px-4 border-t border-zinc-800/50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-zinc-50 mb-3">Planos simples e transparentes</h2>
            <p className="text-zinc-500">Cancele quando quiser, sem fidelidade</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Mensal */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-7 flex flex-col">
              <p className="text-sm font-medium text-zinc-400 mb-1">Plano Mensal</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-4xl font-bold text-zinc-50">R$ 20</span>
                <span className="text-zinc-500 mb-1.5">/mês</span>
              </div>
              <p className="text-xs text-zinc-600 mb-6">Cobrança todo mês</p>
              <ul className="space-y-2 mb-8 flex-1">
                {['Upload ilimitado de planilhas', 'QR codes em PNG', 'Histórico completo', 'Suporte por e-mail'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-zinc-400">
                    <svg className="w-4 h-4 text-violet-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="block text-center py-2.5 rounded-xl border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800 text-zinc-300 text-sm font-medium transition-colors"
              >
                Começar agora
              </Link>
            </div>

            {/* Anual — Recomendado */}
            <div className="relative bg-zinc-900 border-2 border-violet-500 rounded-2xl p-7 flex flex-col shadow-lg shadow-violet-500/10">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="px-3 py-1 rounded-full bg-violet-600 text-white text-xs font-semibold">
                  Recomendado
                </span>
              </div>
              <p className="text-sm font-medium text-zinc-400 mb-1">Plano Anual</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-4xl font-bold text-zinc-50">R$ 16</span>
                <span className="text-zinc-500 mb-1.5">,67/mês</span>
              </div>
              <p className="text-xs text-zinc-600 mb-1">
                Cobrado anualmente — R$ 200,00/ano
              </p>
              <p className="text-xs text-emerald-400 font-medium mb-6">Economize R$ 40,00 por ano</p>
              <ul className="space-y-2 mb-8 flex-1">
                {['Upload ilimitado de planilhas', 'QR codes em PNG', 'Histórico completo', 'Suporte por e-mail'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-zinc-400">
                    <svg className="w-4 h-4 text-violet-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="block text-center py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors"
              >
                Começar agora
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-zinc-800/50 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-600">
          <span className="font-bold text-violet-400/70">Nexlabel</span>
          <span>© {new Date().getFullYear()} Nexlabel · Todos os direitos reservados</span>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-zinc-400 transition-colors">Entrar</Link>
            <Link href="/signup" className="hover:text-zinc-400 transition-colors">Cadastrar</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
