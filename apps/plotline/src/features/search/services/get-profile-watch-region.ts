import type { Profile } from '@plotline/payload-types'

import { payloadFetch, type PayloadPaginatedDocs } from '@/lib/payload/payload-fetch'
import { DEFAULT_WATCH_REGION, resolveProfileWatchRegion } from '@/utils/watch-region'

export async function getProfileWatchRegion(clerkUserId: string): Promise<string> {
  try {
    const result = await payloadFetch<PayloadPaginatedDocs<Profile>>('/api/profiles', {
      clerkUserId,
      method: 'GET',
      searchParams: {
        depth: 0,
        limit: 1,
        'where[clerkUserId][equals]': clerkUserId,
      },
    })

    return resolveProfileWatchRegion(result.docs[0]?.preferences?.region)
  } catch {
    return DEFAULT_WATCH_REGION
  }
}
