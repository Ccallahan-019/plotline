import type { LibraryItem } from '@plotline/payload-types'
import type { MediaStatus } from '@plotline/shared/constants'
import type { QueryClient, QueryKey } from '@tanstack/react-query'

import { MEDIA_STATUSES } from '@plotline/shared/constants'

import type { LibraryItemsResponse } from '../../library-grid/types'
import type { UpdateLibraryItemInput } from '../../types/mutations'

export type LibraryItemQuerySnapshot = {
  previousGridItems: Array<[QueryKey, LibraryItemsResponse | undefined]>
  previousLookupItems: Array<[QueryKey, LibraryItem[] | undefined]>
}

type GridPageUpdateOptions = {
  now?: string
  statuses?: readonly MediaStatus[]
}

/**
 * Patches one library item on a grid page, or drops it when a status filter excludes it.
 *
 * `totalDocs` decreases only when this page actually contained the row.
 *
 * @param response - Cached grid page
 * @param libraryItemId - Library item the edit applies to
 * @param input - Status and/or personal notes
 * @param options.now - Clock value for newly stamped status dates
 * @param options.statuses - Status filter for this grid query; omit when the grid is unfiltered
 * @returns The patched page, or `response` when this page has nothing to change
 */
export function applyLibraryItemUpdateToGridPage(
  response: LibraryItemsResponse,
  libraryItemId: number | string,
  input: UpdateLibraryItemInput,
  options?: GridPageUpdateOptions,
): LibraryItemsResponse {
  const match = response.docs.find((doc) => libraryItemIdsMatch(doc.id, libraryItemId))

  if (!match) {
    return response
  }

  const patched = patchLibraryItemFromUpdate(
    match,
    libraryItemId,
    input,
    options?.now ?? new Date().toISOString(),
  )

  if (shouldDropFromStatusFilter(patched.status, options?.statuses)) {
    return removeLibraryItemFromGridPage(response, libraryItemId)
  }

  if (patched === match) {
    return response
  }

  return {
    ...response,
    docs: response.docs.map((doc) => (doc === match ? patched : doc)),
  }
}

/**
 * Patches one library item in an unfiltered lookup list.
 *
 * Lookup queries are not status-filtered, so a status change stays in the list.
 *
 * @param items - Cached lookup rows
 * @param libraryItemId - Library item the edit applies to
 * @param input - Status and/or personal notes
 * @param now - Clock value for newly stamped status dates
 * @returns The patched list, or `items` when nothing changed
 */
export function applyLibraryItemUpdateToLookup(
  items: LibraryItem[],
  libraryItemId: number | string,
  input: UpdateLibraryItemInput,
  now = new Date().toISOString(),
): LibraryItem[] {
  let changed = false
  const next = items.map((item) => {
    const patched = patchLibraryItemFromUpdate(item, libraryItemId, input, now)

    if (patched !== item) {
      changed = true
    }

    return patched
  })

  return changed ? next : items
}

/**
 * Removes one library item from every cached grid page and lookup list.
 *
 * A grid page that does not contain the row is left as it is, including `totalDocs`.
 * Watch-event lists refresh later through `invalidateAfterLibraryMutation`.
 *
 * @param queryClient - Client holding library grid and lookup queries
 * @param libraryItemId - Library item to drop
 */
export function applyOptimisticLibraryItemRemoval(
  queryClient: QueryClient,
  libraryItemId: number | string,
): void {
  writeLibraryGridPages(queryClient, (response) =>
    removeLibraryItemFromGridPage(response, libraryItemId),
  )
  writeLibraryLookupLists(queryClient, (items) => removeLibraryItemFromLookup(items, libraryItemId))
}

/**
 * Patches status and notes for one library item in every grid and lookup cache.
 *
 * Grid pages whose status filter excludes the resulting status drop the row and
 * decrement `totalDocs`. Lookup lists only patch the row. `now` is shared so
 * every cache stamps the same `startedAt` / `completedAt`.
 *
 * @param queryClient - Client holding library grid and lookup queries
 * @param libraryItemId - Library item to patch
 * @param input - Status and/or personal notes to apply
 * @param now - Clock value for newly stamped status dates
 */
export function applyOptimisticLibraryItemUpdate(
  queryClient: QueryClient,
  libraryItemId: number | string,
  input: UpdateLibraryItemInput,
  now = new Date().toISOString(),
): void {
  writeLibraryGridPages(queryClient, (response, queryKey) =>
    applyLibraryItemUpdateToGridPage(response, libraryItemId, input, {
      now,
      statuses: statusesFromLibraryGridQueryKey(queryKey),
    }),
  )
  writeLibraryLookupLists(queryClient, (items) =>
    applyLibraryItemUpdateToLookup(items, libraryItemId, input, now),
  )
}

/**
 * The cached library item a mutation should compare against, if one is loaded.
 *
 * Lookup is preferred because it is the full unfiltered list. Grid pages are
 * checked after that.
 *
 * @param queryClient - Client holding library grid and lookup queries
 * @param libraryItemId - Library item to find
 * @returns The cached row, or `undefined` when no loaded query contains it
 */
export function findCachedLibraryItem(
  queryClient: QueryClient,
  libraryItemId: number | string,
): LibraryItem | undefined {
  for (const [, items] of queryClient.getQueriesData<LibraryItem[]>({
    queryKey: ['library-items', 'lookup'],
  })) {
    const match = items?.find((item) => libraryItemIdsMatch(item.id, libraryItemId))

    if (match) {
      return match
    }
  }

  for (const [, response] of queryClient.getQueriesData<LibraryItemsResponse>({
    queryKey: ['library-items', 'grid'],
  })) {
    const match = response?.docs.find((item) => libraryItemIdsMatch(item.id, libraryItemId))

    if (match) {
      return match
    }
  }

  return undefined
}

/**
 * Applies a status and notes edit to one cached library item.
 *
 * Mirrors `stampStatusTransitionDates`: `startedAt` is set when entering
 * `watching`, and `completedAt` when entering `completed`, only if that date
 * is empty. A movie that newly becomes `completed` gets `progress.watched`.
 * TV episode progress is left as it is. Blank notes are stored as `null`.
 *
 * @param item - Cached library item
 * @param libraryItemId - Item the edit applies to; other rows are returned unchanged
 * @param input - Status and/or personal notes
 * @param now - Clock value for a newly stamped status date
 * @returns The patched item, or `item` when the id does not match or nothing changed
 */
export function patchLibraryItemFromUpdate(
  item: LibraryItem,
  libraryItemId: number | string,
  input: UpdateLibraryItemInput,
  now = new Date().toISOString(),
): LibraryItem {
  if (!libraryItemIdsMatch(item.id, libraryItemId)) {
    return item
  }

  let next = item

  if (input.status !== undefined && input.status !== item.status) {
    next = applyStatusTransition(item, input.status, now)
  }

  if (input.personalNotes !== undefined) {
    const personalNotes = normalizePersonalNotes(input.personalNotes)

    if (personalNotes !== storedPersonalNotes(next.personalNotes)) {
      next = { ...next, personalNotes }
    }
  }

  return next
}

/**
 * Drops one library item from a grid page and decrements `totalDocs` when it was present.
 *
 * @param response - Cached grid page
 * @param libraryItemId - Library item to remove
 * @returns The page without that item, or `response` when it was not on the page
 */
export function removeLibraryItemFromGridPage(
  response: LibraryItemsResponse,
  libraryItemId: number | string,
): LibraryItemsResponse {
  const docs = response.docs.filter((doc) => !libraryItemIdsMatch(doc.id, libraryItemId))

  if (docs.length === response.docs.length) {
    return response
  }

  return {
    ...response,
    docs,
    totalDocs: Math.max(0, response.totalDocs - (response.docs.length - docs.length)),
  }
}

/**
 * Drops one library item from an unfiltered lookup list.
 *
 * @param items - Cached lookup rows
 * @param libraryItemId - Library item to remove
 * @returns The list without that item, or `items` when it was absent
 */
export function removeLibraryItemFromLookup(
  items: LibraryItem[],
  libraryItemId: number | string,
): LibraryItem[] {
  const next = items.filter((item) => !libraryItemIdsMatch(item.id, libraryItemId))

  return next.length === items.length ? items : next
}

/**
 * Body to send for a library-item update.
 *
 * An unchanged status is omitted so saving the current status cannot create
 * another completed watch event. Blank notes match `null`. Returns `null` when
 * the cached item would not change. When the item is not loaded, the caller's
 * fields are still sent.
 *
 * @param item - Library item before the edit, when it is known
 * @param input - Status and/or personal notes from the caller
 * @returns The request body, or `null` when the edit should be skipped
 */
export function resolveLibraryItemUpdate(
  item: LibraryItem | undefined,
  input: UpdateLibraryItemInput,
): null | UpdateLibraryItemInput {
  const request: UpdateLibraryItemInput = {}

  if (input.personalNotes !== undefined) {
    const personalNotes = normalizePersonalNotes(input.personalNotes)

    if (!item || personalNotes !== storedPersonalNotes(item.personalNotes)) {
      request.personalNotes = personalNotes
    }
  }

  if (input.status !== undefined && (!item || input.status !== item.status)) {
    request.status = input.status
  }

  if (request.personalNotes === undefined && request.status === undefined) {
    return null
  }

  return request
}

/**
 * Puts grid and lookup caches back to a pre-mutation snapshot.
 *
 * @param queryClient - Client holding library grid and lookup queries
 * @param snapshot - Snapshot from `snapshotLibraryItemQueries`; ignored when missing
 */
export function restoreLibraryItemQuerySnapshot(
  queryClient: QueryClient,
  snapshot: LibraryItemQuerySnapshot | undefined,
): void {
  if (!snapshot) {
    return
  }

  for (const [queryKey, data] of snapshot.previousGridItems) {
    queryClient.setQueryData(queryKey, data)
  }

  for (const [queryKey, data] of snapshot.previousLookupItems) {
    queryClient.setQueryData(queryKey, data)
  }
}

/**
 * Cancels in-flight library queries and copies the grid and lookup caches.
 *
 * The `library-items` prefix includes watched-episode queries, so those requests
 * are cancelled too and cannot overwrite the optimistic library row.
 *
 * @param queryClient - Client holding library queries
 * @returns Grid and lookup snapshots to restore if the mutation fails
 */
export async function snapshotLibraryItemQueries(
  queryClient: QueryClient,
): Promise<LibraryItemQuerySnapshot> {
  await queryClient.cancelQueries({ queryKey: ['library-items'] })

  return {
    previousGridItems: queryClient.getQueriesData<LibraryItemsResponse>({
      queryKey: ['library-items', 'grid'],
    }),
    previousLookupItems: queryClient.getQueriesData<LibraryItem[]>({
      queryKey: ['library-items', 'lookup'],
    }),
  }
}

/**
 * Status, date, and movie-watched fields for a real status change.
 *
 * @param item - Library item before this edit
 * @param status - Next status; callers skip this when it matches `item.status`
 * @param now - Clock value used when a transition date is still empty
 * @returns A new library item with the status applied
 */
function applyStatusTransition(item: LibraryItem, status: MediaStatus, now: string): LibraryItem {
  const enteredCompleted = status === 'completed' && item.status !== 'completed'
  const enteredWatching = status === 'watching' && item.status !== 'watching'

  return {
    ...item,
    ...(enteredCompleted && !item.completedAt ? { completedAt: now } : {}),
    ...(enteredCompleted && item.progress.type === 'movie'
      ? {
          progress: {
            ...item.progress,
            type: 'movie',
            watched: true,
          },
        }
      : {}),
    ...(enteredWatching && !item.startedAt ? { startedAt: now } : {}),
    status,
  }
}

// True when a grid query-key entry is one of the library statuses.
function isMediaStatus(value: unknown): value is MediaStatus {
  return typeof value === 'string' && MEDIA_STATUSES.some((status) => status === value)
}

// Library item ids arrive as numbers from Payload and strings from route params.
function libraryItemIdsMatch(left: number | string, right: number | string): boolean {
  return String(left) === String(right)
}

// Trims notes and stores an empty value as null, matching the update endpoint.
function normalizePersonalNotes(value: null | string): null | string {
  const trimmed = value?.trim() ?? ''

  return trimmed.length > 0 ? trimmed : null
}

// A status-filtered grid loses the row when the resulting status is outside that filter.
function shouldDropFromStatusFilter(
  status: MediaStatus,
  statuses: readonly MediaStatus[] | undefined,
): boolean {
  return statuses != null && statuses.length > 0 && !statuses.includes(status)
}

/**
 * Status filter stored on a library grid query key.
 *
 * Grid keys are `['library-items', 'grid', filters, page, pageSize, sort]`,
 * matching `libraryGridQueryKeys.libraryItems`. Missing or empty statuses mean
 * the grid is not status-filtered.
 *
 * @param queryKey - React Query key for one grid page
 * @returns The status allowlist, or `undefined` when this grid shows every status
 */
function statusesFromLibraryGridQueryKey(queryKey: QueryKey): MediaStatus[] | undefined {
  const filters: unknown = queryKey[2]

  if (filters == null || typeof filters !== 'object' || Array.isArray(filters)) {
    return undefined
  }

  if (!('statuses' in filters) || !Array.isArray(filters.statuses)) {
    return undefined
  }

  const statuses = filters.statuses.filter(isMediaStatus)

  return statuses.length > 0 ? statuses : undefined
}

// Null and missing notes compare equal to a cleared textarea.
function storedPersonalNotes(value: null | string | undefined): null | string {
  if (value == null) {
    return null
  }

  return normalizePersonalNotes(value)
}

// Writes each cached library grid page. Pages with no data yet are skipped.
function writeLibraryGridPages(
  queryClient: QueryClient,
  update: (response: LibraryItemsResponse, queryKey: QueryKey) => LibraryItemsResponse,
): void {
  for (const [queryKey, response] of queryClient.getQueriesData<LibraryItemsResponse>({
    queryKey: ['library-items', 'grid'],
  })) {
    if (!response) {
      continue
    }

    queryClient.setQueryData(queryKey, update(response, queryKey))
  }
}

// Writes each cached library lookup list. Lists with no data yet are skipped.
function writeLibraryLookupLists(
  queryClient: QueryClient,
  update: (items: LibraryItem[]) => LibraryItem[],
): void {
  for (const [queryKey, items] of queryClient.getQueriesData<LibraryItem[]>({
    queryKey: ['library-items', 'lookup'],
  })) {
    if (!items) {
      continue
    }

    queryClient.setQueryData(queryKey, update(items))
  }
}
