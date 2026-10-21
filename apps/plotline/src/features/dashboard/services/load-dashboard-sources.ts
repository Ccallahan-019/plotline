import type { LibraryItem, Review, WatchEvent, Watchlist } from '@plotline/payload-types'

import { getWatchlists } from '@/features/watchlists/services/get-watchlists'
import { fetchAllPages } from '@/lib/payload/fetch-all-pages'
import { payloadFetch, type PayloadPaginatedDocs } from '@/lib/payload/payload-fetch'

// Large pages keep long histories well under the fetch-all page cap (100 x 1000 docs).
const HISTORY_PAGE_SIZE = 1000

type LoadCollectionOptions<T> = {
  depth: 0 | 1
  select?: readonly (keyof T)[]
  shouldStop?: (docs: readonly T[]) => boolean
  sort: string
  where?: Record<string, string>
}

/**
 * Counts completed films on the profile.
 *
 * The count is Payload's `totalDocs` for status `completed` and movie progress.
 * The response row itself is unused.
 *
 * @param clerkUserId - Clerk user id forwarded to Payload
 * @returns How many completed movie library items the profile has
 * @throws When the Payload request fails
 */
export async function countCompletedFilms(clerkUserId: string): Promise<number> {
  const result = await payloadFetch<PayloadPaginatedDocs<LibraryItem>>('/api/library-items', {
    clerkUserId,
    method: 'GET',
    searchParams: {
      depth: 0,
      limit: 1,
      'where[progress.type][equals]': 'movie',
      'where[status][equals]': 'completed',
    },
  })

  return result.totalDocs
}

/**
 * Loads the profile's enabled challenge watchlists.
 *
 * Stats live on the watchlist document, so the lists are enough for the
 * activity snapshot and the completed-challenge count.
 *
 * @param clerkUserId - Clerk user id forwarded to Payload
 * @returns Challenge watchlists in list order
 * @throws When a Payload request fails or paging does not finish
 */
export async function loadChallengeWatchlists(clerkUserId: string): Promise<Watchlist[]> {
  return getWatchlists(clerkUserId, { filter: 'challenge' })
}

/**
 * Loads every library item for the signed-in profile.
 *
 * Media is populated so recommendation seeds and library keys can use TMDB ids.
 *
 * @param clerkUserId - Clerk user id forwarded to Payload
 * @returns Library items in id order
 * @throws When a Payload request fails or paging does not finish
 */
export async function loadLibraryItems(clerkUserId: string): Promise<LibraryItem[]> {
  return loadCollection<LibraryItem>(clerkUserId, '/api/library-items', { depth: 1, sort: 'id' })
}

/**
 * Loads every review for the signed-in profile.
 *
 * @param clerkUserId - Clerk user id forwarded to Payload
 * @param depth - Payload relationship depth. `1` populates the reviewed title
 * @param options.select - Fields to return; omit for whole documents
 * @returns Reviews in id order
 * @throws When a Payload request fails or paging does not finish
 */
export async function loadReviews(
  clerkUserId: string,
  depth: 0 | 1,
  options?: { select?: readonly (keyof Review)[] },
): Promise<Review[]> {
  return loadCollection<Review>(clerkUserId, '/api/reviews', {
    depth,
    select: options?.select,
    sort: 'id',
  })
}

/**
 * Loads watch events for the signed-in profile.
 *
 * By default every event is loaded in id order. `depth` 0 leaves `media` as an id
 * for the year summary. `depth` 1 populates titles for the activity feed.
 *
 * `newestFirst` instead loads from the newest event backwards and ends as soon as
 * `enough` accepts the events loaded so far, so a feed page does not read the whole
 * history. `from` and `to` bound `watchedAt` in the database, and `to` also serves
 * as the cursor position.
 *
 * @param clerkUserId - Clerk user id forwarded to Payload
 * @param depth - Payload relationship depth
 * @param options.newestFirst.enough - True once the loaded events are all a caller needs
 * @param options.newestFirst.from - Earliest `watchedAt` instant to load
 * @param options.newestFirst.to - Latest `watchedAt` instant to load
 * @param options.select - Fields to return; omit for whole documents
 * @returns Watch events in id order, or newest first (ties by id) for `newestFirst`
 * @throws When a Payload request fails or paging does not finish
 */
export async function loadWatchEvents(
  clerkUserId: string,
  depth: 0 | 1,
  options?: {
    newestFirst?: {
      enough: (events: readonly WatchEvent[]) => boolean
      from?: null | string
      to?: null | string
    }
    select?: readonly (keyof WatchEvent)[]
  },
): Promise<WatchEvent[]> {
  const newestFirst = options?.newestFirst

  if (!newestFirst) {
    return loadCollection<WatchEvent>(clerkUserId, '/api/watch-events', {
      depth,
      select: options?.select,
      sort: 'id',
    })
  }

  const events = await loadCollection<WatchEvent>(clerkUserId, '/api/watch-events', {
    depth,
    select: options?.select,
    shouldStop: newestFirst.enough,
    sort: '-watchedAt,-id',
    where: {
      ...(newestFirst.from ? { 'where[watchedAt][greater_than_equal]': newestFirst.from } : {}),
      ...(newestFirst.to ? { 'where[watchedAt][less_than_equal]': newestFirst.to } : {}),
    },
  })

  return uniqueById(events)
}

// Follows Payload pages for one collection. A stable sort keeps offset paging from skipping rows.
// Big pages keep the request count (and the page cap) away from a long viewing history.
async function loadCollection<T>(
  clerkUserId: string,
  path: string,
  { depth, select, shouldStop, sort, where }: LoadCollectionOptions<T>,
): Promise<T[]> {
  return fetchAllPages<T>(
    (page) =>
      payloadFetch<PayloadPaginatedDocs<T>>(path, {
        clerkUserId,
        method: 'GET',
        searchParams: {
          depth,
          limit: HISTORY_PAGE_SIZE,
          page,
          sort,
          ...selectSearchParams(select),
          ...where,
        },
      }),
    path,
    { shouldStop },
  )
}

// `select[field]=true` pairs so Payload returns only the fields the math reads.
function selectSearchParams(select: readonly PropertyKey[] | undefined): Record<string, string> {
  return Object.fromEntries((select ?? []).map((field) => [`select[${String(field)}]`, 'true']))
}

// Offset paging over a newest-first sort can repeat a row when an event lands between pages.
function uniqueById<T extends { id: number }>(docs: readonly T[]): T[] {
  const seen = new Set<number>()

  return docs.filter((doc) => {
    if (seen.has(doc.id)) {
      return false
    }

    seen.add(doc.id)

    return true
  })
}
