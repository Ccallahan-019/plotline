import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { ShowIf } from '@/components/utils/ShowIf'
import { cn } from '@/lib/utils'

import type { FilterDefinition, FilterFieldRenderProps } from '../types'

import { CollapsibleCheckboxGroup } from '../components/CollapsibleCheckboxGroup'
import { getWatchlistBadgeLabel } from '../services/get-watchlist-badge-label'

export const WATCHLIST_FILTER_KEY = 'watchlist'

function WatchlistFilterField({ context, draftFilters, setDraftFilters }: FilterFieldRenderProps) {
  const watchlists = context.watchlists ?? []
  const selectedWatchlistIds = draftFilters.watchlistIds ?? []
  const onWatchlist = draftFilters.onWatchlist

  const handleOnWatchlistChange = (checked: boolean) => {
    setDraftFilters({
      ...draftFilters,
      onWatchlist: checked === true ? true : undefined,
      watchlistIds: undefined,
    })
  }

  const handleNotOnWatchlistChange = (checked: boolean) => {
    setDraftFilters({
      ...draftFilters,
      onWatchlist: checked === true ? false : undefined,
      watchlistIds: undefined,
    })
  }

  const handleCollapsibleCheckboxChange = (selectedIds: (number | string)[]) => {
    setDraftFilters({
      ...draftFilters,
      onWatchlist: undefined,
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
            onCheckedChange={handleOnWatchlistChange}
          />
          <FieldLabel
            className={cn(onWatchlist !== true && 'text-muted-foreground')}
            htmlFor="on-watchlist"
          >
            Any
          </FieldLabel>
        </Field>

        <Field orientation="horizontal">
          <Checkbox
            checked={onWatchlist === false}
            id="not-on-watchlist"
            onCheckedChange={handleNotOnWatchlistChange}
          />
          <FieldLabel
            className={cn(onWatchlist !== false && 'text-muted-foreground')}
            htmlFor="not-on-watchlist"
          >
            None
          </FieldLabel>
        </Field>

        <ShowIf condition={watchlists.length > 0}>
          <CollapsibleCheckboxGroup
            fieldIdPrefix="watchlist"
            items={watchlists}
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
    if (filters.onWatchlist === undefined && !filters.watchlistIds?.length) {
      return null
    }

    return {
      key: WATCHLIST_FILTER_KEY,
      label: getWatchlistBadgeLabel(filters, context),
      prefix: 'Watchlist',
    }
  },
}
