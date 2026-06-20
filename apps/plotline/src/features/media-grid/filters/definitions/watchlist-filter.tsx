import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { ShowIf } from '@/components/utils/ShowIf'

import type {
  FilterDefinition,
  FilterFieldRenderProps,
  FilterRenderContext,
  MediaFilters,
} from '../types'

import { CollapsibleCheckboxGroup } from '../components/CollapsibleCheckboxGroup'

export const WATCHLIST_FILTER_KEY = 'watchlist'

function getWatchlistBadgeLabel(filters: MediaFilters, context: FilterRenderContext): string {
  const labels: string[] = []

  if (filters.onWatchlist) {
    labels.push('On any watchlist')
  }

  if (filters.watchlistIds?.length) {
    const labelById = context.watchlistNameById

    const watchlistLabels = filters.watchlistIds.map(
      (watchlistId) => labelById?.get(watchlistId) ?? `Watchlist ${watchlistId}`,
    )

    labels.push(watchlistLabels.join(', '))
  }

  return labels.join(' · ')
}

function WatchlistFilterField({ context, draftFilters, setDraftFilters }: FilterFieldRenderProps) {
  const watchlists = context.watchlists ?? []
  const selectedWatchlistIds = draftFilters.watchlistIds ?? []
  const onWatchlist = draftFilters.onWatchlist

  const handleWatchlistChange = (checked: boolean) => {
    setDraftFilters({
      ...draftFilters,
      onWatchlist: checked === true ? true : undefined,
    })
  }

  const handleCollapsibleCheckboxChange = (selectedIds: (number | string)[]) => {
    setDraftFilters({
      ...draftFilters,
      watchlistIds: selectedIds.length > 0 ? selectedIds.map((id) => Number(id)) : undefined,
    })
  }

  return (
    <Field>
      <FieldLabel className="font-semibold mb-2">Watchlists</FieldLabel>
      <FieldGroup className="gap-3">
        <Field orientation="horizontal">
          <Checkbox
            checked={onWatchlist === true}
            id="on-watchlist"
            onCheckedChange={handleWatchlistChange}
          />
          <FieldLabel htmlFor="on-watchlist">On any watchlist</FieldLabel>
        </Field>

        <ShowIf condition={watchlists.length > 0}>
          <CollapsibleCheckboxGroup
            fieldIdPrefix="watchlist"
            items={watchlists}
            label="Specific Watchlists"
            onChange={handleCollapsibleCheckboxChange}
            selectedIds={selectedWatchlistIds}
            showAllLabel={`Show all ${watchlists.length} watchlists`}
          />
        </ShowIf>
      </FieldGroup>
    </Field>
  )
}

export const watchlistFilterDefinition: FilterDefinition = {
  group: 'library',
  key: WATCHLIST_FILTER_KEY,
  label: 'Watchlists',
  remove: (filters) => {
    const next = { ...filters }
    delete next.onWatchlist
    delete next.watchlistIds
    return next
  },
  render: (props) => <WatchlistFilterField {...props} />,
  toBadge: (filters, context) => {
    if (!filters.onWatchlist && !filters.watchlistIds?.length) {
      return null
    }

    return {
      key: WATCHLIST_FILTER_KEY,
      label: getWatchlistBadgeLabel(filters, context),
      prefix: 'Watchlist',
    }
  },
}
