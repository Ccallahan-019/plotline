import { payloadFetch } from '@/lib/payload/payload-fetch'

import type { AddToListInput, AddToListResult } from '../../types/mutations'

import { enrichAddToListInput } from './enrich-add-to-list-input'

export async function addToList(
  clerkUserId: string,
  input: AddToListInput,
): Promise<AddToListResult> {
  const enrichedInput = await enrichAddToListInput(input)

  return payloadFetch<AddToListResult>('/api/library/add-to-list', {
    body: enrichedInput,
    clerkUserId,
    method: 'POST',
  })
}
