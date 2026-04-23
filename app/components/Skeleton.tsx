export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-zinc-800 ${className}`} />
  )
}

export function UploadAreaSkeleton() {
  return (
    <div className="border-2 border-dashed border-zinc-700 rounded-2xl p-10 flex flex-col items-center gap-3 animate-pulse">
      <div className="w-12 h-12 rounded-xl bg-zinc-800" />
      <div className="space-y-2 text-center">
        <Skeleton className="h-4 w-56 mx-auto" />
        <Skeleton className="h-3 w-72 mx-auto" />
      </div>
    </div>
  )
}

export function UploadListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between px-4 py-4 rounded-xl bg-zinc-900 border border-zinc-800 animate-pulse"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex-shrink-0" />
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-3 w-24 hidden sm:block" />
        </div>
      ))}
    </div>
  )
}

export function CodeGridSkeleton({ cards = 8 }: { cards?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {Array.from({ length: cards }).map((_, i) => (
        <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex flex-col gap-2 animate-pulse">
          <div className="bg-zinc-800 rounded-lg aspect-square" />
          <Skeleton className="h-3 w-3/4 mx-auto" />
          <Skeleton className="h-3 w-1/2 mx-auto" />
        </div>
      ))}
    </div>
  )
}

export function PlanCardSkeleton() {
  return (
    <div className="rounded-2xl border-2 border-zinc-800 p-5 animate-pulse space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-44" />
        </div>
        <div className="space-y-1 text-right">
          <Skeleton className="h-7 w-20" />
          <Skeleton className="h-3 w-10 ml-auto" />
        </div>
      </div>
    </div>
  )
}
