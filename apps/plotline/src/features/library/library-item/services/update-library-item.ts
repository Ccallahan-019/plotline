import { payloadFetch } from '@/lib/payload/payload-fetch'

import type { UpdateLibraryItemInput, UpdateLibraryItemResult } from '../../types/mutations'

import { libraryItemPath } from './library-item-path'

/**
 * Updates status and/or personal notes on one owned library item.
 *
 * Forwards to the owner-scoped Payload endpoint so status-date stamping, the
 * completed watch event, and watchlist membership sync still run.
 *
 * @param clerkUserId - Clerk user id sent as the profile context
 * @param libraryItemId - Library item to update
 * @param input - Status and/or personal notes
 * @returns The updated library item
 * @throws {PayloadClientError} When Payload rejects the update
 */
export async function updateLibraryItem(
  clerkUserId: string,
  libraryItemId: string,
  input: UpdateLibraryItemInput,
): Promise<UpdateLibraryItemResult> {
  return payloadFetch<UpdateLibraryItemResult>(libraryItemPath(libraryItemId), {
    body: input,
    clerkUserId,
    method: 'PATCH',
  })
}
