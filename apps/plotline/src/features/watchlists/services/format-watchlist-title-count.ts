/**
 * Membership count label for a watchlist.
 *
 * @param titleCount - Number of titles on the list
 * @returns `1 Title` when there is one title, otherwise `N Titles`
 */
export function formatWatchlistTitleCount(titleCount: number): string {
  return titleCount === 1 ? '1 Title' : `${titleCount} Titles`
}
