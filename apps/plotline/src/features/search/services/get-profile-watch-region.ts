import type { Profile } from '@plotline/payload-types'

import {
  DEFAULT_WATCH_REGION,
  resolveProfileWatchRegion,
} from '@/features/search/services/watch-region'
import { payloadFetch, type PayloadPaginatedDocs } from '@/lib/payload/payload-fetch'

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
