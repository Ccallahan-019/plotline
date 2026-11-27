import { describe, expect, it } from 'vitest'

import { episodeStillUrl, mediaImageUrl, titleBackdropUrl } from '../media-image-url'

describe('episodeStillUrl', () => {
  it('prefers the episode still and falls back to the series backdrop', () => {
    expect(episodeStillUrl('/still.jpg', '/backdrop.jpg')).toBe(mediaImageUrl('/still.jpg', 'w300'))
    expect(episodeStillUrl(null, '/backdrop.jpg')).toBe(mediaImageUrl('/backdrop.jpg', 'w780'))
    expect(episodeStillUrl(undefined, '/backdrop.jpg')).toBe(mediaImageUrl('/backdrop.jpg', 'w780'))
    expect(episodeStillUrl('', '/backdrop.jpg')).toBe(mediaImageUrl('/backdrop.jpg', 'w780'))
    expect(episodeStillUrl(null, null)).toBeNull()
    expect(episodeStillUrl(undefined, undefined)).toBeNull()
  })
})

describe('titleBackdropUrl', () => {
  it('matches the title hero backdrop URL', () => {
    expect(titleBackdropUrl('/still.jpg')).toBe(mediaImageUrl('/still.jpg', 'w1280'))
  })

  it('returns null when the title has no backdrop', () => {
    expect(titleBackdropUrl(null)).toBeNull()
    expect(titleBackdropUrl(undefined)).toBeNull()
    expect(titleBackdropUrl('')).toBeNull()
  })
})
