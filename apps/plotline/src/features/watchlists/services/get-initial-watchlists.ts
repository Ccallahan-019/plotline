import { getWatchlists } from '@/features/watchlists/services/get-watchlists'
import { PayloadClientError } from '@/lib/payload/payload-fetch'

export async function getInitialWatchlists(clerkUserId: string) {
  let initialError: null | string = null
  let initialWatchlists: Awaited<ReturnType<typeof getWatchlists>> = []

  try {
    initialWatchlists = await getWatchlists(clerkUserId)
  } catch (error) {
    if (error instanceof PayloadClientError && error.status === 404) {
      initialWatchlists = []
    } else if (error instanceof Error) {
      initialError = error.message
    } else {
      initialError = 'Failed to load watchlists'
    }
  }

  return { initialError, initialWatchlists }
}
