/** When set on a library-item update, suppresses the auto-emitted completed watch-event. */
export const SKIP_COMPLETED_WATCH_EVENT = 'skipCompletedWatchEvent'

/**
 * When set on watch-event create, the sync hook does nothing: the log-watch endpoints write
 * `lastWatchedAt`, progress, `rewatchCount`, and `profile.statsCache` once per request.
 */
export const SKIP_PROGRESS_SYNC_FROM_WATCH_EVENT = 'skipProgressSyncFromWatchEvent'
