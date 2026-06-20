/**
 * Domain enums mirrored in Payload collection configs.
 * Import from here in both apps to keep select options in sync.
 */

export const MEDIA_STATUSES = ['planned', 'watching', 'completed', 'dropped', 'on_hold'] as const

export type MediaStatus = (typeof MEDIA_STATUSES)[number]

export const MEDIA_TYPES = ['movie', 'tv'] as const

export type MediaType = (typeof MEDIA_TYPES)[number]

export const WATCH_EVENT_TYPES = [
  'started',
  'progress',
  'completed',
  'rewatched',
  'dropped',
  'on_hold',
] as const

export type WatchEventType = (typeof WATCH_EVENT_TYPES)[number]

export const VISIBILITIES = ['private', 'friends', 'public', 'unlisted'] as const

export type Visibility = (typeof VISIBILITIES)[number]

export const STREAMING_PLATFORMS = [
  'netflix',
  'disney_plus',
  'hulu',
  'max',
  'apple_tv',
  'amazon',
  'theater',
  'physical',
  'other',
] as const

export type StreamingPlatform = (typeof STREAMING_PLATFORMS)[number]

export const MEDIA_RELEASE_STATUSES = [
  'released',
  'upcoming',
  'cancelled',
  'in_production',
] as const

export type MediaReleaseStatus = (typeof MEDIA_RELEASE_STATUSES)[number]
