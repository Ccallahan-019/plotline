import { payloadFetch } from '@/lib/payload/payload-fetch'

import type { AddToListInput, AddToListResult } from '../../types/mutations'

export async function addToList(
  clerkUserId: string,
  input: AddToListInput,
): Promise<AddToListResult> {
  return payloadFetch<AddToListResult>('/api/library/add-to-list', {
    body: input,
    clerkUserId,
    method: 'POST',
  })
}
