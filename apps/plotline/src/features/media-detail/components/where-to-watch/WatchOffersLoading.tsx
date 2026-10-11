import { Item, ItemContent, ItemGroup, ItemMedia } from '@/components/ui/item'
import { Skeleton } from '@/components/ui/skeleton'

const WATCH_OFFER_SKELETON_COUNT = 2

export function WatchOffersLoading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-medium text-muted-foreground">Rent</h3>
        <ItemGroup aria-busy="true" aria-label="Loading watch options" className="gap-2">
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

      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-medium text-muted-foreground">Buy</h3>
        <ItemGroup aria-busy="true" aria-label="Loading watch options" className="gap-2">
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
    </div>
  )
}
