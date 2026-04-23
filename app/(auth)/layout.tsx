export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-violet-400 tracking-tight">Nexlabel</h1>
          <p className="text-zinc-500 text-sm mt-1">Geração de QR codes profissional</p>
        </div>
        {children}
      </div>
    </div>
  )
}
