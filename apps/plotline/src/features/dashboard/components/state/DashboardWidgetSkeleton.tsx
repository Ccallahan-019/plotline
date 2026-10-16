import { cn } from 'cn'

import { Skeleton } from '@/components/ui/skeleton'

export function DashboardWidgetSkeleton({ className }: { className?: string }) {
  return <Skeleton className={cn('h-36 w-full rounded-xl', className)} />
}
