import { describe, expect, it } from 'vitest'

import { formatMembershipDescription } from '../format-membership-metadata'

describe('formatMembershipDescription', () => {
  it('returns null when both labels are missing', () => {
    expect(formatMembershipDescription(null, null)).toBeNull()
    expect(formatMembershipDescription('', '')).toBeNull()
  })

  it('joins the labels that are present', () => {
    expect(formatMembershipDescription('2024 · Film', null)).toBe('2024 · Film')
    expect(formatMembershipDescription(null, 'Added Jan 2, 2026')).toBe('Added Jan 2, 2026')
    expect(formatMembershipDescription('2024 · Film', 'Added Jan 2, 2026')).toBe(
      '2024 · Film · Added Jan 2, 2026',
    )
  })
})
