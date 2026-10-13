import { Item, ItemContent, ItemGroup, ItemMedia } from '@/components/ui/item'
import { Skeleton } from '@/components/ui/skeleton'

const WATCH_OFFER_SKELETON_COUNT = 2
const WATCH_OFFER_SKELETON_LABELS = ['Rent', 'Buy'] as const

export function WatchOffersLoading() {
  return (
    <div aria-busy="true" aria-label="Loading watch options" className="flex flex-col gap-4">
      {WATCH_OFFER_SKELETON_LABELS.map((label) => (
        <div className="flex flex-col gap-2" key={label}>
          <h3 className="text-xs font-medium text-muted-foreground">{label}</h3>
          <ItemGroup className="gap-2">
            {Array.from({ length: WATCH_OFFER_SKELETON_COUNT }, (_, index) => (
              <Item key={index} size="xs" variant="outline">
                <ItemMedia variant="image">
                  <Skeleton className="h-10 w-10" />
                </ItemMedia>
                <ItemContent>
                  <Skeleton className="h-4 w-32" />
                </ItemContent>
              </Item>
            ))}
          </ItemGroup>
        </div>
      ))}
    </div>
  )
}
