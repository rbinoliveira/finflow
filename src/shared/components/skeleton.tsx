import { cn } from '@/shared/utils/cn.util'

type SkeletonProps = {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn('animate-pulse rounded-xl bg-white/6', className)}
    />
  )
}

type SkeletonListProps = {
  rows?: number
}

export function SkeletonList({ rows = 4 }: SkeletonListProps) {
  return (
    <div className="flex flex-col gap-2.5">
      {Array.from({ length: rows }, (unused, index) => (
        <Skeleton key={index} className="h-16 w-full" />
      ))}
    </div>
  )
}
