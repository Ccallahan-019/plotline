import {
  getStreamingPlatformMeta,
  STREAMING_PLATFORM_REGISTRY,
  STREAMING_PLATFORMS,
} from '@plotline/shared/constants'
import { describe, expect, it } from 'vitest'

describe('STREAMING_PLATFORM_REGISTRY', () => {
  it('covers every StreamingPlatform in enum order', () => {
    expect(STREAMING_PLATFORM_REGISTRY.map((entry) => entry.value)).toEqual([
      ...STREAMING_PLATFORMS,
    ])
  })

  it('maps streaming slugs to US TMDB provider IDs', () => {
    expect(getStreamingPlatformMeta('amazon').tmdbProviderId).toBe(9)
    expect(getStreamingPlatformMeta('apple_tv').tmdbProviderId).toBe(350)
    expect(getStreamingPlatformMeta('disney_plus').tmdbProviderId).toBe(337)
    expect(getStreamingPlatformMeta('hulu').tmdbProviderId).toBe(15)
    expect(getStreamingPlatformMeta('max').tmdbProviderId).toBe(1899)
    expect(getStreamingPlatformMeta('netflix').tmdbProviderId).toBe(8)
  })

  it('uses lucide fallbacks for non-streaming slugs', () => {
    expect(getStreamingPlatformMeta('other').lucideIcon).toBe('more-horizontal')
    expect(getStreamingPlatformMeta('physical').lucideIcon).toBe('disc')
    expect(getStreamingPlatformMeta('theater').lucideIcon).toBe('clapperboard')
  })
})
