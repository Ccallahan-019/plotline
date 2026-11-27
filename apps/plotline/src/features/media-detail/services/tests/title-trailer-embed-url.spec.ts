import { describe, expect, it } from 'vitest'

import { titleTrailerEmbedUrl } from '../title-trailer-embed-url'

describe('titleTrailerEmbedUrl', () => {
  it('builds a privacy-enhanced YouTube embed URL from the video key', () => {
    expect(titleTrailerEmbedUrl('abc_12-Z')).toBe(
      'https://www.youtube-nocookie.com/embed/abc_12-Z',
    )
  })
})
