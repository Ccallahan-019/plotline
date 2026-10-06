import { fetchJson } from '@/lib/api/fetch-json'

import type { LogWatchInput, LogWatchResult } from '../../types/mutations'

/**
 * Posts a single movie or TV-episode watch to the log-watch API.
 *
 * @param input - Watch payload, including optional TV season and episode
 * @returns The updated library item and created watch event
 */
export function postLogWatch(input: LogWatchInput): Promise<LogWatchResult> {
  return fetchJson<LogWatchResult>('/api/library/log-watch', {
    body: JSON.stringify(input),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
}
