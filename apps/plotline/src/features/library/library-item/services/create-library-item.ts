import { payloadFetch } from '@/lib/payload/payload-fetch'

import type { CreateLibraryItemInput, CreateLibraryItemResult } from '../../types/mutations'

import { enrichAddToListInput } from '../../add-to-list/services/enrich-add-to-list-input'

/**
 * Creates a library item for the current profile from catalog media.
 *
 * TMDB references are filled from title details before the write, the same way
 * add-to-list builds the catalog row.
 * Forwards to the owner-scoped Payload endpoint. An existing `(profile, media)`
 * row is a 409. Status defaults to `planned` on the server when omitted.
 *
 * @param clerkUserId - Clerk user id sent as the profile context
 * @param input - Existing media id or TMDB fields, plus optional library status
 * @returns The created library item
 * @throws {PayloadClientError} When Payload rejects the create
 * @throws {Error} When a TMDB reference is present and TMDB is not configured
 */
export async function createLibraryItem(
  clerkUserId: string,
  input: CreateLibraryItemInput,
): Promise<CreateLibraryItemResult> {
  const enrichedInput = await enrichAddToListInput(input)

  return payloadFetch<CreateLibraryItemResult>('/api/library/library-items', {
    body: enrichedInput,
    clerkUserId,
    method: 'POST',
  })
}
