import { Card, CardAction, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

import { seasonEpisodeCardClassName } from './MediaSeasonEpisodeCard'

export function MediaSeasonEpisodeCardSkeleton() {
  return (
    <Card aria-hidden className={cn(seasonEpisodeCardClassName, 'pt-0')} size="sm">
      <Skeleton className="aspect-video w-full rounded-none" />
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-4 w-4/5" />
        </CardTitle>
        <CardDescription>
          <Skeleton className="h-3.5 w-12" />
        </CardDescription>
        <CardAction>
          <Skeleton className="size-7 shrink-0" />
        </CardAction>
      </CardHeader>
    </Card>
  )
}
