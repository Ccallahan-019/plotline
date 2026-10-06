import { FilterRenderContext, MediaFilters } from '../types'

export function getWatchlistBadgeLabel(
  filters: MediaFilters,
  context: FilterRenderContext,
): string {
  const labels: string[] = []

  if (filters.onWatchlist === true) {
    labels.push('Any')
  }

  if (filters.onWatchlist === false) {
    labels.push('None')
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
