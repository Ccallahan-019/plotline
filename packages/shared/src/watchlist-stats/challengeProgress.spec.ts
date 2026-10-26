import { describe, expect, it } from 'vitest'

import {
  formatChallengeProgress,
  getChallengeMetaLabels,
  isRuntimeChallengeGoal,
} from './challengeProgress'

describe('formatChallengeProgress', () => {
  it('formats a count goal for a card', () => {
    expect(
      formatChallengeProgress({
        completed: 31,
        goalCount: 52,
        goalType: 'count',
        totalEligible: 40,
        variant: 'card',
      }),
    ).toBe('31 of 52 titles')
  })

  it('formats a count goal for the detail hero', () => {
    expect(
      formatChallengeProgress({
        completed: 31,
        goalCount: 52,
        goalType: 'count',
        totalEligible: 40,
        variant: 'detail',
      }),
    ).toBe('31 / 52 titles')
  })

  it('uses films when the TV rule is movies only', () => {
    expect(
      formatChallengeProgress({
        completed: 31,
        goalCount: 52,
        goalType: 'count',
        totalEligible: 52,
        tvCountRule: 'movies_only',
        variant: 'card',
      }),
    ).toBe('31 of 52 films')
  })

  it('falls back to total eligible titles when the count goal is unset', () => {
    expect(
      formatChallengeProgress({
        completed: 3,
        goalType: 'count',
        totalEligible: 10,
        variant: 'detail',
      }),
    ).toBe('3 / 10 titles')
  })

  it('formats runtime minutes as hours and keeps whole hours as integers', () => {
    expect(
      formatChallengeProgress({
        completed: 38 * 60,
        goalRuntimeMinutes: 100 * 60,
        goalType: 'runtime_minutes',
        totalEligible: 80 * 60,
        variant: 'card',
      }),
    ).toBe('38 of 100 hrs')

    expect(
      formatChallengeProgress({
        completed: 38 * 60,
        goalRuntimeMinutes: 100 * 60,
        goalType: 'runtime_minutes',
        totalEligible: 80 * 60,
        variant: 'detail',
      }),
    ).toBe('38 / 100 hrs')
  })

  it('shows a fractional hour to one decimal', () => {
    expect(
      formatChallengeProgress({
        completed: 90,
        goalRuntimeMinutes: 120,
        goalType: 'runtime_minutes',
        totalEligible: 120,
        variant: 'card',
      }),
    ).toBe('1.5 of 2 hrs')
  })

  it('keeps hours for a movies-only runtime goal', () => {
    expect(
      formatChallengeProgress({
        completed: 60,
        goalRuntimeMinutes: 180,
        goalType: 'runtime_minutes',
        totalEligible: 180,
        tvCountRule: 'movies_only',
        variant: 'detail',
      }),
    ).toBe('1 / 3 hrs')
  })

  it('infers a runtime goal from goalRuntimeMinutes when goal type is omitted', () => {
    expect(
      formatChallengeProgress({
        completed: 120,
        goalRuntimeMinutes: 180,
        totalEligible: 60,
        variant: 'card',
      }),
    ).toBe('2 of 3 hrs')
  })

  it('falls back to total eligible minutes for a runtime goal without a target', () => {
    expect(
      formatChallengeProgress({
        completed: 30,
        goalType: 'runtime_minutes',
        totalEligible: 90,
        variant: 'card',
      }),
    ).toBe('0.5 of 1.5 hrs')
  })

  it('counts a list size goal as titles and ignores a leftover runtime', () => {
    expect(
      formatChallengeProgress({
        completed: 12,
        goalCount: null,
        goalRuntimeMinutes: 6000,
        goalType: 'list_size',
        totalEligible: 40,
        variant: 'card',
      }),
    ).toBe('12 of 40 titles')

    expect(
      formatChallengeProgress({
        completed: 12,
        goalCount: null,
        goalRuntimeMinutes: 6000,
        goalType: 'list_size',
        totalEligible: 40,
        tvCountRule: 'movies_only',
        variant: 'detail',
      }),
    ).toBe('12 / 40 films')
  })

  it('ignores a stored count on a list size goal and reads the cached total', () => {
    expect(
      formatChallengeProgress({
        completed: 12,
        goalCount: 52,
        goalType: 'list_size',
        totalEligible: 40,
        variant: 'card',
      }),
    ).toBe('12 of 40 titles')
  })

  it('groups large counts', () => {
    expect(
      formatChallengeProgress({
        completed: 1000,
        goalCount: 2000,
        goalType: 'count',
        totalEligible: 2000,
        variant: 'card',
      }),
    ).toBe('1,000 of 2,000 titles')
  })
})

describe('getChallengeMetaLabels', () => {
  it('labels a count challenge that excludes rewatches', () => {
    expect(
      getChallengeMetaLabels({
        dueDate: '2026-12-31',
        goalType: 'count',
        includeRewatches: false,
        tvCountRule: 'tv_by_episode',
      }),
    ).toEqual([
      { label: 'Goal type', value: 'Count' },
      { label: 'Due date', value: 'Dec 31, 2026' },
      { label: 'TV counting', value: 'By episode' },
      { label: 'Rewatches', value: 'Excluded' },
    ])
  })

  it('labels runtime, movies only, seasons, and included rewatches', () => {
    expect(
      getChallengeMetaLabels({
        dueDate: '2026-06-01T00:00:00.000Z',
        goalType: 'runtime_minutes',
        includeRewatches: true,
        tvCountRule: 'movies_only',
      }),
    ).toEqual([
      { label: 'Goal type', value: 'Runtime' },
      { label: 'Due date', value: 'Jun 1, 2026' },
      { label: 'TV counting', value: 'Movies only' },
      { label: 'Rewatches', value: 'Included' },
    ])
  })

  it('labels a list size challenge', () => {
    expect(
      getChallengeMetaLabels({
        goalType: 'list_size',
      })[0],
    ).toEqual({ label: 'Goal type', value: 'List' })
  })

  it('uses the collection defaults when challenge fields are omitted', () => {
    expect(getChallengeMetaLabels({})).toEqual([
      { label: 'Goal type', value: 'Count' },
      { label: 'Due date', value: '—' },
      { label: 'TV counting', value: 'As a series' },
      { label: 'Rewatches', value: 'Excluded' },
    ])
  })

  it('names the remaining TV counting rules', () => {
    expect(getChallengeMetaLabels({ tvCountRule: 'tv_as_series' })[2]).toEqual({
      label: 'TV counting',
      value: 'As a series',
    })
    expect(getChallengeMetaLabels({ tvCountRule: 'tv_by_season' })[2]).toEqual({
      label: 'TV counting',
      value: 'By season',
    })
  })

  it('replaces an unparseable due date', () => {
    expect(getChallengeMetaLabels({ dueDate: 'not-a-date' })[1]).toEqual({
      label: 'Due date',
      value: '—',
    })
  })
})

describe('isRuntimeChallengeGoal', () => {
  it('follows the declared goal type', () => {
    expect(isRuntimeChallengeGoal({ goalType: 'runtime_minutes' })).toBe(true)
    expect(isRuntimeChallengeGoal({ goalRuntimeMinutes: 6000, goalType: 'count' })).toBe(false)
    expect(isRuntimeChallengeGoal({ goalRuntimeMinutes: 6000, goalType: 'list_size' })).toBe(false)
  })

  it('infers runtime from stored minutes only when the type is omitted', () => {
    expect(isRuntimeChallengeGoal({ goalRuntimeMinutes: 6000 })).toBe(true)
    expect(isRuntimeChallengeGoal({ goalCount: 10, goalRuntimeMinutes: 6000 })).toBe(false)
    expect(isRuntimeChallengeGoal({})).toBe(false)
  })
})
