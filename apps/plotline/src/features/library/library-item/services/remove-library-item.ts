import { payloadFetch } from '@/lib/payload/payload-fetch'

import type { RemoveLibraryItemResult } from '../../types/mutations'

import { libraryItemPath } from './library-item-path'

/**
 * Removes one owned library item and permanently deletes its watch history.
 *
 * Forwards to the owner-scoped Payload endpoint, which also drops watchlist
 * memberships and clears the profile stats cache. Reviews stay.
 *
 * @param clerkUserId - Clerk user id sent as the profile context
 * @param libraryItemId - Library item to remove
 * @returns The id of the removed library item
 * @throws {PayloadClientError} When Payload rejects the removal
 */
export async function removeLibraryItem(
  clerkUserId: string,
  libraryItemId: string,
): Promise<RemoveLibraryItemResult> {
  return payloadFetch<RemoveLibraryItemResult>(libraryItemPath(libraryItemId), {
    clerkUserId,
    method: 'DELETE',
  })
}
