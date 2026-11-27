import { describe, expect, it } from 'vitest'

import { includeVideoLanguage } from './include-video-language'

describe('includeVideoLanguage', () => {
  it('asks for English and untagged videos when no extra language is given', () => {
    expect(includeVideoLanguage()).toBe('en,null')
    expect(includeVideoLanguage([])).toBe('en,null')
  })

  it('places a viewer language ahead of English and drops duplicates', () => {
    expect(includeVideoLanguage(['JA', 'en', 'null', 'en-US'])).toBe('ja,en,null')
  })

  it('drops codes that are not languages', () => {
    expect(includeVideoLanguage(['', 'english', 'f'])).toBe('en,null')
  })

  it('keeps English and untagged videos when the caller sends more than five codes', () => {
    expect(includeVideoLanguage(['ja', 'fr', 'de', 'es', 'ko'])).toBe('ja,fr,de,en,null')
  })
})
