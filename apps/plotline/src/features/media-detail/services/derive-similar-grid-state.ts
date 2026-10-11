type QueryStatus = {
  isError: boolean
  isLoading: boolean
}

/**
 * Picks the grid state for the Similar tab.
 *
 * The grid needs both the similar titles and the library lookup: rendering before the lookup
 * resolves would show tracked titles as untracked and let the user add them a second time.
 * A query that is disabled (not yet fetching) is not loading, so an invalid title id falls
 * through to the empty state instead of a permanent skeleton.
 *
 * @param similar - Status of the similar-titles query
 * @param library - Status of the library lookup query
 * @param resultCount - Number of similar titles loaded
 * @returns `error` if either query failed, `loading` while either is fetching its first data, `empty` with no titles, otherwise `success`
 */
export function deriveSimilarGridState(
  similar: QueryStatus,
  library: QueryStatus,
  resultCount: number,
): 'empty' | 'error' | 'loading' | 'success' {
  if (similar.isError || library.isError) {
    return 'error'
  }

  if (similar.isLoading || library.isLoading) {
    return 'loading'
  }

  return resultCount === 0 ? 'empty' : 'success'
}
