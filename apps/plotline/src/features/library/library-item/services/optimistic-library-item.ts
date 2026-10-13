import type { LibraryItem } from '@plotline/payload-types'
import type { MediaStatus } from '@plotline/shared/constants'
import type { QueryClient } from '@tanstack/react-query'

import type { LibraryItemsResponse } from '../../library-grid/types'
import type { LibraryItemQuerySnapshot } from '../../services/library-query-snapshot'
import type { UpdateLibraryItemInput } from '../../types/mutations'

type LibraryItemField = keyof LibraryItem

/**
 * Patches one library item on a grid page.
 *
 * The row stays on the page even when a status filter no longer matches it. Dropping
 * it here would unmount an open drawer before the request resolves; the refetch after
 * the mutation settles removes it instead.
 *
 * @param response - Cached grid page
 * @param libraryItemId - Library item the edit applies to
 * @param input - Status and/or personal notes
 * @param now - Clock value for newly stamped status dates
 * @returns The patched page, or `response` when this page has nothing to change
 */
export function applyLibraryItemUpdateToGridPage(
  response: LibraryItemsResponse,
  libraryItemId: number | string,
  input: UpdateLibraryItemInput,
  now = new Date().toISOString(),
): LibraryItemsResponse {
  const match = response.docs.find((doc) => libraryItemIdsMatch(doc.id, libraryItemId))

  if (!match) {
    return response
  }

  const patched = patchLibraryItemFromUpdate(match, libraryItemId, input, now)

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
 * `now` is shared so every cache stamps the same `startedAt` / `completedAt`.
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
  writeLibraryGridPages(queryClient, (response) =>
    applyLibraryItemUpdateToGridPage(response, libraryItemId, input, now),
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
 * Puts a removed library item back where it was after a failed delete.
 *
 * Re-inserts the row at its snapshot index on each grid page and lookup list that held
 * it and no longer does, and adds it back to `totalDocs`. Other rows keep whatever
 * optimistic edits they have received since the snapshot.
 *
 * @param queryClient - Client holding library grid and lookup queries
 * @param snapshot - Snapshot taken before the optimistic removal; ignored when missing
 * @param libraryItemId - Library item the failed delete applied to
 */
export function revertOptimisticLibraryItemRemoval(
  queryClient: QueryClient,
  snapshot: LibraryItemQuerySnapshot | undefined,
  libraryItemId: number | string,
): void {
  if (!snapshot) {
    return
  }

  for (const [queryKey, previous] of snapshot.previousGridItems) {
    const index = previous?.docs.findIndex((doc) => libraryItemIdsMatch(doc.id, libraryItemId))
    const previousItem = index != null && index >= 0 ? previous?.docs[index] : undefined

    if (!previousItem || index == null) {
      continue
    }

    queryClient.setQueryData<LibraryItemsResponse>(queryKey, (current) => {
      if (!current || current.docs.some((doc) => libraryItemIdsMatch(doc.id, libraryItemId))) {
        return current
      }

      const docs = [...current.docs]
      docs.splice(Math.min(index, docs.length), 0, previousItem)

      return { ...current, docs, totalDocs: current.totalDocs + 1 }
    })
  }

  for (const [queryKey, previous] of snapshot.previousLookupItems) {
    const index = previous?.findIndex((item) => libraryItemIdsMatch(item.id, libraryItemId))
    const previousItem = index != null && index >= 0 ? previous?.[index] : undefined

    if (!previousItem || index == null) {
      continue
    }

    queryClient.setQueryData<LibraryItem[]>(queryKey, (current) => {
      if (!current || current.some((item) => libraryItemIdsMatch(item.id, libraryItemId))) {
        return current
      }

      const items = [...current]
      items.splice(Math.min(index, items.length), 0, previousItem)

      return items
    })
  }
}

/**
 * Reverts only the fields a failed update changed on one library item.
 *
 * Restoring a whole-cache snapshot would also undo another edit to the same row that
 * is still in flight (a notes save while a status save runs, or the reverse). Only the
 * fields in `input` are copied back from the snapshot, in every grid page and lookup
 * list that holds the row. Status takes its stamped dates and movie progress with it.
 *
 * @param queryClient - Client holding library grid and lookup queries
 * @param snapshot - Snapshot taken before the optimistic write; ignored when missing
 * @param libraryItemId - Library item the failed update applied to
 * @param input - The update that failed
 */
export function revertOptimisticLibraryItemUpdate(
  queryClient: QueryClient,
  snapshot: LibraryItemQuerySnapshot | undefined,
  libraryItemId: number | string,
  input: UpdateLibraryItemInput,
): void {
  if (!snapshot) {
    return
  }

  const fields: LibraryItemField[] = [
    ...(input.status !== undefined
      ? (['completedAt', 'progress', 'startedAt', 'status'] as const)
      : []),
    ...(input.personalNotes !== undefined ? (['personalNotes'] as const) : []),
  ]

  for (const [queryKey, previous] of snapshot.previousGridItems) {
    const previousItem = previous?.docs.find((doc) => libraryItemIdsMatch(doc.id, libraryItemId))

    if (!previousItem) {
      continue
    }

    queryClient.setQueryData<LibraryItemsResponse>(queryKey, (current) =>
      current
        ? {
            ...current,
            docs: current.docs.map((doc) =>
              libraryItemIdsMatch(doc.id, libraryItemId)
                ? revertLibraryItemFields(doc, previousItem, fields)
                : doc,
            ),
          }
        : current,
    )
  }

  for (const [queryKey, previous] of snapshot.previousLookupItems) {
    const previousItem = previous?.find((item) => libraryItemIdsMatch(item.id, libraryItemId))

    if (!previousItem) {
      continue
    }

    queryClient.setQueryData<LibraryItem[]>(queryKey, (current) =>
      current?.map((item) =>
        libraryItemIdsMatch(item.id, libraryItemId)
          ? revertLibraryItemFields(item, previousItem, fields)
          : item,
      ),
    )
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

// Library item ids arrive as numbers from Payload and strings from route params.
function libraryItemIdsMatch(left: number | string, right: number | string): boolean {
  return String(left) === String(right)
}

// Trims notes and stores an empty value as null, matching the update endpoint.
function normalizePersonalNotes(value: null | string): null | string {
  const trimmed = value?.trim() ?? ''

  return trimmed.length > 0 ? trimmed : null
}

// Copies `fields` from `previous` onto `current`; a field absent from `previous` is removed.
function revertLibraryItemFields(
  current: LibraryItem,
  previous: LibraryItem,
  fields: readonly LibraryItemField[],
): LibraryItem {
  const next = { ...current }
  // Fields are copied or deleted by name, which the item's per-field types cannot express.
  const target = next as unknown as Record<string, unknown>

  for (const field of fields) {
    if (previous[field] === undefined) {
      delete target[field]
    } else {
      target[field] = previous[field]
    }
  }

  return next
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
  update: (response: LibraryItemsResponse) => LibraryItemsResponse,
): void {
  for (const [queryKey, response] of queryClient.getQueriesData<LibraryItemsResponse>({
    queryKey: ['library-items', 'grid'],
  })) {
    if (!response) {
      continue
    }

    queryClient.setQueryData(queryKey, update(response))
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
