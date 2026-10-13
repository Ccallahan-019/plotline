import { toNonNegativeInteger } from '@plotline/shared/utils'

/**
 * Reads the 1-based reviews page from a request URL.
 *
 * @param requestUrl - Full URL of the incoming reviews request
 * @returns The page, `1` when omitted or blank, or `null` when the value is not a positive integer
 */
export function parseReviewPage(requestUrl: string): null | number {
  const pageParam = new URL(requestUrl).searchParams.get('page')

  if (pageParam == null || pageParam.trim() === '') {
    return 1
  }

  const page = toNonNegativeInteger(pageParam)

  if (page == null || page < 1) {
    return null
  }

  return page
}
