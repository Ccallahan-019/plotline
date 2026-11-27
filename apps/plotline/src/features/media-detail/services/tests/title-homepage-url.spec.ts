import { describe, expect, it } from 'vitest'

import { titleHomepageUrl } from '../title-homepage-url'

describe('titleHomepageUrl', () => {
  it('keeps a trimmed https URL', () => {
    expect(titleHomepageUrl(' https://example.com/film ')).toBe('https://example.com/film')
  })

  it('drops a blank, insecure, or unparseable value', () => {
    expect(titleHomepageUrl('')).toBeNull()
    expect(titleHomepageUrl('   ')).toBeNull()
    expect(titleHomepageUrl(null)).toBeNull()
    expect(titleHomepageUrl(undefined)).toBeNull()
    expect(titleHomepageUrl('http://example.com/show')).toBeNull()
    expect(titleHomepageUrl('not a url')).toBeNull()
  })
})
