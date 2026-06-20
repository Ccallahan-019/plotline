import { fetchJson } from '@/lib/api/fetch-json'

import type { LogWatchInput, LogWatchResult } from '../../types/mutations'

export function postLogWatch(input: LogWatchInput): Promise<LogWatchResult> {
  return fetchJson<LogWatchResult>('/api/library/log-watch', {
    body: JSON.stringify(input),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  })
}
