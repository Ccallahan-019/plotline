import type { Watchlist } from '@plotline/payload-types'

import { fetchJson } from '@/lib/api/fetch-json'

/** Reopens a finished list-size challenge. Returns the watchlist with its recalculated stats. */
export function postReopenChallenge(slug: string): Promise<Watchlist> {
  return fetchJson<Watchlist>(`/api/watchlists/${encodeURIComponent(slug)}/reopen-challenge`, {
    method: 'POST',
  })
}
