import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'

type MediaPlaceholderTabProps = {
  description: string
  title: string
}

export function MediaPlaceholderTab({ description, title }: MediaPlaceholderTabProps) {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
