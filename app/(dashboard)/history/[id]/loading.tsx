import { CodeGridSkeleton, Skeleton } from '@/app/components/Skeleton'

export default function UploadDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-zinc-800 animate-pulse" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>

      {/* Toggle skeleton */}
      <div className="flex bg-zinc-800/60 border border-zinc-700/50 rounded-xl p-1 w-fit gap-1 animate-pulse">
        <div className="h-9 w-28 rounded-lg bg-zinc-700" />
        <div className="h-9 w-40 rounded-lg bg-zinc-800" />
      </div>

      <CodeGridSkeleton cards={10} />
    </div>
  )
}
