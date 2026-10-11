import { Activity } from 'lucide-react'

import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty'

export function MediaActivityEmpty() {
  return (
    <Empty className="border">
      <EmptyMedia variant="icon">
        <Activity />
      </EmptyMedia>
      <EmptyTitle>No Activity</EmptyTitle>
      <EmptyDescription>Log your first watch to see your activity here.</EmptyDescription>
    </Empty>
  )
}
