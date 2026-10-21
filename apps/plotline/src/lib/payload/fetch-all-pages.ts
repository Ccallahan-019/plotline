import type { PayloadPaginatedDocs } from './payload-fetch'

export const MAX_PAYLOAD_PAGES = 100

export type FetchAllPagesOptions<T> = {
  /** Page cap before the load throws. Defaults to `MAX_PAYLOAD_PAGES`. */
  maxPages?: number
  /**
   * Called with every doc loaded so far after each page. Returning true ends the
   * load early, which suits newest-first requests that only need a leading slice.
   */
  shouldStop?: (docs: readonly T[]) => boolean
}

/**
 * Follows Payload `hasNextPage` until every matching doc is loaded.
 *
 * The page loader is passed in so callers choose the request and tests can
 * drive the paging without Payload.
 *
 * @param fetchPage - Loads one page of docs. Called once per page, starting at 1
 * @param label - Names the request in error messages
 * @param options.maxPages - Page cap before the load throws
 * @param options.shouldStop - Ends the load early once the docs loaded so far are enough
 * @returns Docs from every page loaded, in page order
 * @throws When the next page does not advance or the page cap is hit
 */
export async function fetchAllPages<T>(
  fetchPage: (page: number) => Promise<PayloadPaginatedDocs<T>>,
  label: string,
  options?: FetchAllPagesOptions<T>,
): Promise<T[]> {
  const maxPages = options?.maxPages ?? MAX_PAYLOAD_PAGES
  const docs: T[] = []
  let page = 1

  while (page <= maxPages) {
    const result = await fetchPage(page)

    docs.push(...result.docs)

    if (!result.hasNextPage || options?.shouldStop?.(docs)) {
      return docs
    }

    const nextPage = result.nextPage ?? page + 1

    if (nextPage <= page) {
      throw new Error(`Payload page did not advance for ${label}`)
    }

    page = nextPage
  }

  throw new Error(`Payload page limit exceeded for ${label}`)
}
