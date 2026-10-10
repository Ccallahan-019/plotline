import { fetchJson } from '@/lib/api/fetch-json'

import type {
  CreateLibraryItemInput,
  CreateLibraryItemResult,
  RemoveLibraryItemResult,
  UpdateLibraryItemInput,
  UpdateLibraryItemResult,
} from '../../types/mutations'

/**
 * Removes one library item through the library-item BFF route.
 *
 * The Payload endpoint also deletes that item's watch events and watchlist memberships.
 *
 * @param libraryItemId - Library item to remove
 * @returns The id of the removed library item
 * @throws {FetchJsonError} When the BFF or Payload rejects the removal
 */
export function deleteLibraryItem(
  libraryItemId: number | string,
): Promise<RemoveLibraryItemResult> {
  return fetchJson<RemoveLibraryItemResult>(libraryItemBffPath(libraryItemId), {
    method: 'DELETE',
  })
}

/**
 * Patches status and/or personal notes through the library-item BFF route.
 *
 * @param libraryItemId - Library item to update
 * @param input - Status and/or personal notes. Unchanged status should already be omitted.
 * @returns The updated library item
 * @throws {FetchJsonError} When the BFF or Payload rejects the update
 */
export function patchLibraryItem(
  libraryItemId: number | string,
  input: UpdateLibraryItemInput,
): Promise<UpdateLibraryItemResult> {
  return fetchJson<UpdateLibraryItemResult>(libraryItemBffPath(libraryItemId), {
    body: JSON.stringify(input),
    headers: { 'Content-Type': 'application/json' },
    method: 'PATCH',
  })
}

/**
 * Creates a library item through the library-items BFF route.
 *
 * The server upserts catalog media and inserts the row. Status defaults to
 * `planned` when omitted. A title already in the library is rejected.
 *
 * @param input - Existing media id or TMDB fields, plus optional library status
 * @returns The created library item
 * @throws {FetchJsonError} When the BFF or Payload rejects the create
 */
export function postLibraryItem(input: CreateLibraryItemInput): Promise<CreateLibraryItemResult> {
  return fetchJson<CreateLibraryItemResult>('/api/library-items', {
    body: JSON.stringify(input),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
}

// Same-origin BFF path. `libraryItemPath` targets the Payload route instead.
function libraryItemBffPath(libraryItemId: number | string): string {
  return `/api/library-items/${encodeURIComponent(String(libraryItemId))}`
}
