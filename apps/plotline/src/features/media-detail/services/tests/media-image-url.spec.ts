import { describe, expect, it } from 'vitest'

import { mediaImageUrl, titleBackdropUrl } from '../media-image-url'

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
