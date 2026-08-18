/** When set on a library-item update, suppresses the auto-emitted completed watch-event. */
export const SKIP_COMPLETED_WATCH_EVENT = 'skipCompletedWatchEvent'

/** When set on watch-event create, suppresses per-event progress / episodesWatched rebuild. lastWatchedAt and profile.statsCache still update. */
export const SKIP_PROGRESS_SYNC_FROM_WATCH_EVENT = 'skipProgressSyncFromWatchEvent'
