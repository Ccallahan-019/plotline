'use client'

import { useSyncExternalStore } from 'react'

/**
 * Reads the browser IANA timezone used for dashboard day boundaries.
 *
 * The server snapshot is null so summary and activity queries wait until
 * hydration. Prefetching those with UTC would miss the query key.
 *
 * @returns The resolved IANA timezone, or null during server render
 */
export function useClientTimeZone(): null | string {
  return useSyncExternalStore(subscribeToTimeZone, readClientTimeZone, readServerTimeZone)
}

function readClientTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

function readServerTimeZone(): null {
  return null
}

// The zone does not change during a session, so there is nothing to subscribe to.
function subscribeToTimeZone(): () => void {
  return () => {}
}
