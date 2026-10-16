import { LibraryItem } from '@plotline/payload-types'

import { ContinueWatchingItem, ContinueWatchingTypeFilter } from '../../services/continue-watching'
import { ContinueWatchingItemRow } from './ContinueWatchingItemRow'

type AlsoInProgessContentProps = {
  alsoInProgress: ContinueWatchingItem[]
  libraryItems: ReadonlyMap<number, LibraryItem>
  mediaType: ContinueWatchingTypeFilter
}

export function AlsoInProgessContent({
  alsoInProgress,
  libraryItems,
  mediaType,
}: AlsoInProgessContentProps) {
  if (alsoInProgress.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {mediaType === 'all'
          ? 'Nothing else is in progress.'
          : mediaType === 'movie'
            ? 'No other films are in progress.'
            : 'No other series are in progress.'}
      </p>
    )
  }

  return (
    <ul className="flex flex-col">
      {alsoInProgress.map((item) => (
        <li key={item.id}>
          <ContinueWatchingItemRow item={item} libraryItem={libraryItems.get(item.id)} />
        </li>
      ))}
    </ul>
  )
}
