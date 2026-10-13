import type { PayloadPaginatedDocs } from './payload-fetch'

export const MAX_PAYLOAD_PAGES = 100

/**
 * Follows Payload `hasNextPage` until every matching doc is loaded.
 *
 * The page loader is passed in so callers choose the request and tests can
 * drive the paging without Payload.
 *
 * @param fetchPage - Loads one page of docs. Called once per page, starting at 1
 * @param label - Names the request in error messages
 * @returns Docs from every page, in page order
 * @throws When the next page does not advance or the page cap is hit
 */
export async function fetchAllPages<T>(
  fetchPage: (page: number) => Promise<PayloadPaginatedDocs<T>>,
  label: string,
): Promise<T[]> {
  const docs: T[] = []
  let page = 1

  while (page <= MAX_PAYLOAD_PAGES) {
    const result = await fetchPage(page)

    docs.push(...result.docs)

    if (!result.hasNextPage) {
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
