import { LucideIcon, MailQuestionMark } from 'lucide-react'

import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'

type DashboardWidgetEmptyProps = {
  description: string
  icon?: LucideIcon
  title: string
}

export function DashboardWidgetEmpty({
  description,
  icon = MailQuestionMark,
  title,
}: DashboardWidgetEmptyProps) {
  const Icon = icon

  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
