import { payloadFetch } from '@/lib/payload/payload-fetch'

import type { LogWatchBatchInput, LogWatchBatchResult } from '../../types/mutations'

export async function logWatchBatchEvent(
  clerkUserId: string,
  input: LogWatchBatchInput,
): Promise<LogWatchBatchResult> {
  return payloadFetch<LogWatchBatchResult>('/api/library/log-watch/batch', {
    body: input,
    clerkUserId,
    method: 'POST',
  })
}
