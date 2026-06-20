import { payloadFetch } from '@/lib/payload/payload-fetch'

import type { LogWatchInput, LogWatchResult } from '../../types/mutations'

export async function logWatchEvent(
  clerkUserId: string,
  input: LogWatchInput,
): Promise<LogWatchResult> {
  return payloadFetch<LogWatchResult>('/api/library/log-watch', {
    body: input,
    clerkUserId,
    method: 'POST',
  })
}
