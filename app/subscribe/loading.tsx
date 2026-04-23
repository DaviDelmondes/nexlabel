import { PlanCardSkeleton, Skeleton } from '@/app/components/Skeleton'

export default function SubscribeLoading() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header skeleton */}
      <header className="border-b border-zinc-800 bg-zinc-900/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="h-5 w-24 rounded-lg bg-zinc-800 animate-pulse" />
          <div className="h-4 w-16 rounded-lg bg-zinc-800 animate-pulse" />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <Skeleton className="h-7 w-48 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </div>

          <PlanCardSkeleton />
          <PlanCardSkeleton />

          {/* Payment method tabs skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-3 w-36" />
            <div className="grid grid-cols-2 gap-2">
              <div className="h-12 rounded-xl bg-zinc-800 animate-pulse" />
              <div className="h-12 rounded-xl bg-zinc-800 animate-pulse" />
            </div>
          </div>

          <div className="h-12 rounded-xl bg-zinc-800 animate-pulse" />
        </div>
      </main>
    </div>
  )
}
