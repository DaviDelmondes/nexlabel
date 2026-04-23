import { UploadListSkeleton, Skeleton } from '@/app/components/Skeleton'

export default function HistoryLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-4 w-44 mt-2" />
      </div>

      <UploadListSkeleton rows={6} />
    </div>
  )
}
