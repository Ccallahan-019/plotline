/**
 * Streaming platform enum + display registry.
 * TMDB provider IDs are the US-default JustWatch IDs (verified against TMDB watch-provider lists).
 */

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

export type StreamingPlatformLucideIcon = 'clapperboard' | 'disc' | 'more-horizontal'

export type StreamingPlatformMeta = {
  label: string
  lucideIcon?: StreamingPlatformLucideIcon
  tmdbProviderId?: number
  value: StreamingPlatform
}

const STREAMING_PLATFORM_META: Record<StreamingPlatform, StreamingPlatformMeta> = {
  amazon: { label: 'Prime Video', tmdbProviderId: 9, value: 'amazon' },
  apple_tv: { label: 'Apple TV+', tmdbProviderId: 350, value: 'apple_tv' },
  disney_plus: { label: 'Disney+', tmdbProviderId: 337, value: 'disney_plus' },
  hulu: { label: 'Hulu', tmdbProviderId: 15, value: 'hulu' },
  max: { label: 'Max', tmdbProviderId: 1899, value: 'max' },
  netflix: { label: 'Netflix', tmdbProviderId: 8, value: 'netflix' },
  other: { label: 'Other', lucideIcon: 'more-horizontal', value: 'other' },
  physical: { label: 'Physical Media', lucideIcon: 'disc', value: 'physical' },
  theater: { label: 'In Theaters', lucideIcon: 'clapperboard', value: 'theater' },
}

export const STREAMING_PLATFORM_REGISTRY: StreamingPlatformMeta[] = STREAMING_PLATFORMS.map(
  (value) => STREAMING_PLATFORM_META[value],
)

export function getStreamingPlatformMeta(platform: StreamingPlatform): StreamingPlatformMeta {
  return STREAMING_PLATFORM_META[platform]
}
