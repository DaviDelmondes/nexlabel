import { UploadAreaSkeleton, UploadListSkeleton, Skeleton } from '@/app/components/Skeleton'

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-4 w-64 mt-2" />
      </div>

      <UploadAreaSkeleton />

      <div>
        <Skeleton className="h-5 w-36 mb-3" />
        <UploadListSkeleton rows={3} />
      </div>
    </div>
  )
}
