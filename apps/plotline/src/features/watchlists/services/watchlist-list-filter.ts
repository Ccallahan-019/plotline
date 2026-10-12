import type { WatchlistListFilter } from '../types'

/**
 * Payload `where` params for one watchlist index filter.
 *
 * `list` is every watchlist that is not a challenge, including rows whose
 * `challenge.enabled` checkbox was never stored. `custom` stays `isSystem:
 * false` and can still include challenges.
 *
 * @param filter - List kind. `null` or omitted returns every watchlist the profile can read
 * @returns Search params to merge into a Payload `/api/watchlists` query
 */
export function toWatchlistFilterSearchParams(
  filter: null | undefined | WatchlistListFilter,
): Record<string, string> {
  switch (filter) {
    case 'challenge':
      return { 'where[challenge.enabled][equals]': 'true' }
    case 'custom':
      return { 'where[isSystem][equals]': 'false' }
    case 'list':
      return {
        'where[or][0][challenge.enabled][equals]': 'false',
        'where[or][1][challenge.enabled][exists]': 'false',
      }
    case null:
    case undefined:
      return {}
    case 'system':
      return { 'where[isSystem][equals]': 'true' }
    default: {
      const exhaustive: never = filter

      return exhaustive
    }
  }
}
