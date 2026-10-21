import { describe, expect, it } from 'vitest'

import { calendarDateKey, calendarDaysInYear } from './calendar'
import { heatmapDaysWithTitles, heatmapWeekMonthLabels, layoutHeatmapWeeks } from './layout-heatmap'

describe('layoutHeatmapWeeks', () => {
  const days = calendarDaysInYear(2026).map((date) => ({
    count: calendarDateKey(date) === '2026-01-15' ? 3 : 0,
    date: calendarDateKey(date),
  }))
  const weeks = layoutHeatmapWeeks(days)

  it('pads the first week so January 1 sits on its weekday', () => {
    expect(weeks[0]?.slice(0, 4)).toEqual([
      { kind: 'empty' },
      { kind: 'empty' },
      { kind: 'empty' },
      { count: 0, date: '2026-01-01', kind: 'day' },
    ])
    expect(weeks.every((week) => week.length === 7)).toBe(true)
  })

  it('keeps the count for a day and includes December 31', () => {
    expect(weeks.flat().find((cell) => cell.kind === 'day' && cell.date === '2026-01-15')).toEqual({
      count: 3,
      date: '2026-01-15',
      kind: 'day',
    })
    expect(weeks.at(-1)?.some((cell) => cell.kind === 'day' && cell.date === '2026-12-31')).toBe(
      true,
    )
  })

  it('returns no weeks for an empty year', () => {
    expect(layoutHeatmapWeeks([])).toEqual([])
  })
})

describe('heatmapDaysWithTitles', () => {
  it('keeps days that logged at least one title, in order', () => {
    expect(
      heatmapDaysWithTitles([
        { count: 0, date: '2026-01-01' },
        { count: 2, date: '2026-01-02' },
        { count: 1, date: '2026-01-03' },
      ]),
    ).toEqual([
      { count: 2, date: '2026-01-02' },
      { count: 1, date: '2026-01-03' },
    ])
  })
})

describe('heatmapWeekMonthLabels', () => {
  it('labels each month once, on the week that contains the first', () => {
    const days = calendarDaysInYear(2026).map((date) => ({
      count: 0,
      date: calendarDateKey(date),
    }))
    const labels = heatmapWeekMonthLabels(layoutHeatmapWeeks(days)).filter(
      (label): label is string => label != null,
    )

    expect(labels).toEqual([
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ])
  })
})
