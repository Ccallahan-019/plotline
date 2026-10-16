import type { LibraryItem } from '@plotline/payload-types'

import { ItemGroup } from '@/components/ui/item'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { ContinueWatchingItem } from '@/features/dashboard/services/continue-watching'

import { DashboardUpNextPoster } from './DashboardUpNextPoster'

type DashboardUpNextPostersProps = {
  libraryItems: ReadonlyMap<number, LibraryItem>
  posters: readonly ContinueWatchingItem[]
}

export function DashboardUpNextPosters({ libraryItems, posters }: DashboardUpNextPostersProps) {
  return (
    <ScrollArea>
      <ItemGroup className="flex-row gap-3 pb-3.5">
        {posters.map((item) => (
          <DashboardUpNextPoster
            item={item}
            key={item.id}
            libraryItem={libraryItems.get(item.id)}
          />
        ))}
      </ItemGroup>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
