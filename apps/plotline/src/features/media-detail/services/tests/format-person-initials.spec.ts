import { describe, expect, it } from 'vitest'

import { formatPersonInitials } from '../format-person-initials'

describe('formatPersonInitials', () => {
  it('uses first and last name, or two letters of a single name', () => {
    expect(formatPersonInitials('Casey Ng')).toBe('CN')
    expect(formatPersonInitials('Ada Mary Lovelace')).toBe('AL')
    expect(formatPersonInitials('casey')).toBe('CA')
  })

  it('returns an empty string for a blank name', () => {
    expect(formatPersonInitials('   ')).toBe('')
  })

  it('keeps astral characters whole', () => {
    expect(formatPersonInitials('😀Max Lee')).toBe('😀L')
    expect(formatPersonInitials('😀😀😀')).toBe('😀😀')
  })
})
