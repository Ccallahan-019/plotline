import { describe, expect, it } from 'vitest'

import {
  monthAxisLetter,
  sparklinePoints,
  titlesPerMonthBars,
  titlesPerMonthMinPointSize,
} from './format-dashboard'

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

describe('monthAxisLetter', () => {
  it('uses the first letter of each month name', () => {
    expect(MONTHS.map((month) => monthAxisLetter(month))).toEqual([
      'J',
      'F',
      'M',
      'A',
      'M',
      'J',
      'J',
      'A',
      'S',
      'O',
      'N',
      'D',
    ])
  })

  it('returns an empty string for a missing name', () => {
    expect(monthAxisLetter(null)).toBe('')
  })
})

describe('titlesPerMonthBars', () => {
  const counts = [1, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 2]

  it('gives the highlighted month a stronger fill and the full month name', () => {
    const bars = titlesPerMonthBars(counts, 2)
    const march = bars[2]
    const january = bars[0]

    expect(bars).toHaveLength(12)
    expect(march).toMatchObject({ count: 4, month: 'March' })
    expect(january).toMatchObject({ count: 1, month: 'January' })
    expect(march?.fill).not.toBe(january?.fill)
    expect(bars.filter((bar) => bar.fill === march?.fill)).toHaveLength(1)
  })

  it('uses the stronger fill for every month when no month is highlighted', () => {
    const highlighted = titlesPerMonthBars(counts, 2)
    const plain = titlesPerMonthBars(counts, null)

    expect(new Set(plain.map((bar) => bar.fill))).toEqual(new Set([highlighted[2]?.fill]))
    expect(plain[11]).toMatchObject({ count: 2, month: 'December' })
  })
})

describe('titlesPerMonthMinPointSize', () => {
  it('gives an empty month a visible stub', () => {
    expect(titlesPerMonthMinPointSize(0)).toBe(3)
    expect(titlesPerMonthMinPointSize(null)).toBe(3)
    expect(titlesPerMonthMinPointSize(undefined)).toBe(3)
  })

  it('lets a positive count use its scaled height', () => {
    expect(titlesPerMonthMinPointSize(1)).toBe(0)
    expect(titlesPerMonthMinPointSize(12)).toBe(0)
  })
})

describe('sparklinePoints', () => {
  it('keeps series order as indexed points', () => {
    expect(sparklinePoints([2, 0, 5.5])).toEqual([
      { index: 0, value: 2 },
      { index: 1, value: 0 },
      { index: 2, value: 5.5 },
    ])
  })
})
