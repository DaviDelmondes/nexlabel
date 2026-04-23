import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-zinc-950">
      <div className="text-center space-y-5 max-w-md">
        <div className="text-7xl font-black text-zinc-800 select-none">404</div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-50">Página não encontrada</h1>
          <p className="text-zinc-500 text-sm mt-2">
            A página que você está procurando não existe ou foi movida.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-block px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors"
        >
          Ir ao dashboard
        </Link>
      </div>
    </div>
  )
}
