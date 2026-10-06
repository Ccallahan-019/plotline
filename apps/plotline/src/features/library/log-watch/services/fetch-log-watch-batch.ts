import { fetchJson } from '@/lib/api/fetch-json'

import type { LogWatchBatchInput, LogWatchBatchResult } from '../../types/mutations'

/**
 * Posts selected episodes to the batch log-watch API.
 *
 * @param input - Multi-episode payload including shared watch metadata
 * @returns The updated library item and created watch events
 */
export function postLogWatchBatch(input: LogWatchBatchInput): Promise<LogWatchBatchResult> {
  return fetchJson<LogWatchBatchResult>('/api/library/log-watch/batch', {
    body: JSON.stringify(input),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
}
