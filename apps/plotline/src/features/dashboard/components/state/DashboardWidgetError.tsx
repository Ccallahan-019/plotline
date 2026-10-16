import { LucideIcon, ServerOff } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'

type DashboardWidgetErrorProps = {
  icon?: LucideIcon
  message: string
  onRetry: () => void
  title?: string
}

export function DashboardWidgetError({
  icon = ServerOff,
  message,
  onRetry,
  title = 'Error Loading Data',
}: DashboardWidgetErrorProps) {
  const Icon = icon

  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon />
        </EmptyMedia>

        <EmptyTitle>{title}</EmptyTitle>

        <EmptyDescription>{message}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={onRetry} size="sm" type="button" variant="outline">
          Try Again
        </Button>
      </EmptyContent>
    </Empty>
  )
}
