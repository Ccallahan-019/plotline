import type { TmdbError } from '@plotline/shared/tmdb'

import { NextResponse } from 'next/server'

type TmdbErrorResponseMessages = {
  /** When set, an upstream 422 (page out of range) is answered as a 400 with this message. */
  invalidPage?: string
  /** Body message for an upstream 404. */
  notFound: string
}

/**
 * Maps a failed TMDB call to a BFF route response.
 *
 * Only a missing title and, when the route takes a page, an out-of-range page are the
 * caller's doing. Every other upstream failure (bad token, quota, TMDB outage) is reported
 * as 502, so it cannot be mistaken for the user's own session status.
 *
 * @param error - Error thrown by the TMDB client
 * @param messages - Route-specific body messages
 * @returns 404 for a missing title, 400 for an invalid page when `messages.invalidPage` is set, otherwise 502
 */
export function tmdbErrorResponse(
  error: TmdbError,
  messages: TmdbErrorResponseMessages,
): NextResponse {
  if (error.status === 404) {
    return NextResponse.json({ error: messages.notFound }, { status: 404 })
  }

  if (error.status === 422 && messages.invalidPage !== undefined) {
    return NextResponse.json({ error: messages.invalidPage }, { status: 400 })
  }

  return NextResponse.json({ error: 'TMDB request failed' }, { status: 502 })
}
