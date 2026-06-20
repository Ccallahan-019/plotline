import { fetchJson } from '@/lib/api/fetch-json'

import type { AddToListInput, AddToListResult } from '../../types/mutations'

import { hasAddToListTmdbRef } from '../../types/mutations'

export function postAddToList(input: AddToListInput): Promise<AddToListResult> {
  return fetchJson<AddToListResult>('/api/library/add-to-list', {
    body: JSON.stringify(input),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
}

export async function postAddToLists(inputs: AddToListInput[]): Promise<AddToListResult[]> {
  const usesTmdbRef = inputs.some(hasAddToListTmdbRef)

  if (!usesTmdbRef) {
    return Promise.all(inputs.map((input) => postAddToList(input)))
  }

  const results: AddToListResult[] = []
  let mediaId: number | string | undefined

  for (const input of inputs) {
    const requestInput = mediaId != null ? toMediaIdAddToListInput(input, mediaId) : input
    const result = await postAddToList(requestInput)
    results.push(result)
    mediaId ??= getMediaIdFromAddToListResult(result)
  }

  return results
}

function getMediaIdFromAddToListResult(result: AddToListResult): number | string | undefined {
  const media = result.libraryItem.media

  if (typeof media === 'object' && media != null) {
    return media.id
  }

  return media
}

function toMediaIdAddToListInput(input: AddToListInput, mediaId: number | string): AddToListInput {
  return {
    mediaId,
    note: input.note,
    status: input.status,
    watchlistId: input.watchlistId,
    watchlistSlug: input.watchlistSlug,
  }
}
