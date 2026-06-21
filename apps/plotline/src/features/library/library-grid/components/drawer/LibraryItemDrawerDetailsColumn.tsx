import { formatDate } from '@plotline/shared/utils/dates'
import { Bookmark } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'

import { formatNumber } from '../../services/drawer-helpers'
import { getLibraryItemSourceLabel } from '../../services/to-library-item-drawer-view-model'
import { LibraryItemDrawerViewModel } from '../../types'
import { LibraryItemDrawerField } from './LibraryItemDrawerField'
import { LibraryItemDrawerPlaceholder } from './LibraryItemDrawerPlaceholder'
import { LibraryItemDrawerSection } from './LibraryItemDrawerSection'

type LibraryItemDrawerDetailsColumnProps = {
  isLoadingWatchlists: boolean
  viewModel: LibraryItemDrawerViewModel
}

export function LibraryItemDrawerDetailsColumn({
  isLoadingWatchlists,
  viewModel,
}: LibraryItemDrawerDetailsColumnProps) {
  return (
    <div className="flex flex-col gap-5">
      <LibraryItemDrawerSection title="Activity">
        <div className="grid gap-2">
          <LibraryItemDrawerField label="Started" value={formatDate(viewModel.startedAt)} />
          <LibraryItemDrawerField
            label="Last Watched"
            value={formatDate(viewModel.lastWatchedAt)}
          />
          <LibraryItemDrawerField label="Completed" value={formatDate(viewModel.completedAt)} />
          <LibraryItemDrawerField
            label="Rewatch Count"
            value={formatNumber(viewModel.rewatchCount)}
          />
          <LibraryItemDrawerField
            label="Source"
            value={getLibraryItemSourceLabel(viewModel.source)}
          />
        </div>
      </LibraryItemDrawerSection>

      <LibraryItemDrawerSection title="On Watchlists">
        {isLoadingWatchlists ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner />
            Loading watchlists…
          </div>
        ) : viewModel.watchlists.length === 0 ? (
          <LibraryItemDrawerPlaceholder value="Not on any watchlists" />
        ) : (
          <div className="flex gap-2 -ml-0.5 flex-wrap">
            {viewModel.watchlists.map((watchlist) => (
              <Badge className="h-7" key={watchlist.id} variant="outline">
                <Bookmark data-icon="inline-start" fill="currentColor" />
                {watchlist.name}
              </Badge>
            ))}
          </div>
        )}
      </LibraryItemDrawerSection>
    </div>
  )
}
