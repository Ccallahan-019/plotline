import { LibraryItem } from '@plotline/payload-types'

import {
  ContinueWatchingItem,
  ContinueWatchingTypeFilter,
} from '../../../services/continue-watching'
import { ContinueWatchingItemRow } from './ContinueWatchingItemRow'

type AlsoInProgressContentProps = {
  alsoInProgress: ContinueWatchingItem[]
  libraryItems: ReadonlyMap<number, LibraryItem>
  mediaType: ContinueWatchingTypeFilter
}

export function AlsoInProgressContent({
  alsoInProgress,
  libraryItems,
  mediaType,
}: AlsoInProgressContentProps) {
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
    <div className="@container/cw">
      <ul className="flex min-w-0 flex-col @min-[48rem]/cw:grid @min-[48rem]/cw:grid-cols-[auto_minmax(0,1fr)_minmax(0,16rem)_minmax(0,max-content)_auto]">
        {alsoInProgress.map((item) => (
          <li
            className="@min-[48rem]/cw:col-span-5 @min-[48rem]/cw:grid @min-[48rem]/cw:grid-cols-subgrid"
            key={item.id}
          >
            <ContinueWatchingItemRow item={item} libraryItem={libraryItems.get(item.id)} />
          </li>
        ))}
      </ul>
    </div>
  )
}
