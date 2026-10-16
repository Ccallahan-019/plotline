import { Empty, EmptyDescription, EmptyTitle } from '@/components/ui/empty'

export function RecentActivityEmpty() {
  return (
    <Empty>
      <EmptyTitle>No Recent Activity</EmptyTitle>
      <EmptyDescription>No recent activity was found.</EmptyDescription>
    </Empty>
  )
}
