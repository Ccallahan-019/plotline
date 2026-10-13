import { describe, expect, it } from 'vitest'

import type { StatsLibraryItem, StatsMedia, WatchlistChallengeConfig } from './types'

import { getChallengeExclusion } from './challengeExclusion'
import { deriveMembershipChallengeFields } from './membershipFields'

const addedAt = '2026-06-01T00:00:00.000Z'
const completedBefore = '2026-01-15T00:00:00.000Z'
const completedAfter = '2026-07-01T00:00:00.000Z'

const movie: StatsMedia = { mediaType: 'movie', runtime: 120 }
const series: StatsMedia = { mediaType: 'tv', runtime: 45 }

function challenge(overrides: Partial<WatchlistChallengeConfig> = {}): WatchlistChallengeConfig {
  return {
    enabled: true,
    goalCount: 10,
    goalType: 'count',
    includeRewatches: false,
    priorCompletionRule: 'exclude_if_already_completed',
    tvCountRule: 'tv_as_series',
    ...overrides,
  }
}

function libraryItem(overrides: Partial<StatsLibraryItem> = {}): StatsLibraryItem {
  return {
    completedAt: completedAfter,
    rewatchCount: 0,
    status: 'completed',
    ...overrides,
  }
}

describe('includeRewatches derivation', () => {
  it('excludes a later rewatch of a title finished before join when rewatches are off', () => {
    expect(
      deriveMembershipChallengeFields({
        addedAt,
        challenge: challenge(),
        libraryItem: libraryItem({ completedAt: completedBefore, rewatchCount: 2 }),
        media: movie,
      }),
    ).toMatchObject({ countsTowardGoal: false, listStatus: 'planned' })
  })

  it('counts that rewatch when includeRewatches is on, even though the original finish is excluded', () => {
    expect(
      deriveMembershipChallengeFields({
        addedAt,
        challenge: challenge({ includeRewatches: true }),
        libraryItem: libraryItem({ completedAt: completedBefore, rewatchCount: 1 }),
        media: movie,
      }),
    ).toMatchObject({ countsTowardGoal: true, goalWeight: 1, listStatus: 'completed' })
  })

  it('does not let includeRewatches count a pre-join finish that was never rewatched', () => {
    expect(
      deriveMembershipChallengeFields({
        addedAt,
        challenge: challenge({ includeRewatches: true }),
        libraryItem: libraryItem({ completedAt: completedBefore, rewatchCount: 0 }),
        media: movie,
      }).countsTowardGoal,
    ).toBe(false)
  })

  it('keeps a first completion on or after join when rewatches are off', () => {
    expect(
      deriveMembershipChallengeFields({
        addedAt,
        challenge: challenge(),
        libraryItem: libraryItem({ completedAt: addedAt, rewatchCount: 3 }),
        media: movie,
      }).countsTowardGoal,
    ).toBe(true)
  })

  it('lets a prior-completion rule that already counts the title ignore includeRewatches', () => {
    expect(
      deriveMembershipChallengeFields({
        addedAt,
        challenge: challenge({
          includeRewatches: false,
          priorCompletionRule: 'count_all_on_join',
        }),
        libraryItem: libraryItem({ completedAt: completedBefore, rewatchCount: 4 }),
        media: movie,
      }).countsTowardGoal,
    ).toBe(true)
  })

  it('treats an omitted includeRewatches on an enabled challenge as excluded', () => {
    expect(
      deriveMembershipChallengeFields({
        addedAt,
        challenge: challenge({ includeRewatches: null }),
        libraryItem: libraryItem({ completedAt: completedBefore, rewatchCount: 1 }),
        media: movie,
      }).countsTowardGoal,
    ).toBe(false)
  })

  it('does not apply includeRewatches when challenge mode is off', () => {
    expect(
      deriveMembershipChallengeFields({
        addedAt,
        challenge: challenge({ enabled: false, includeRewatches: true }),
        libraryItem: libraryItem({ completedAt: completedBefore, rewatchCount: 2 }),
        media: movie,
      }).countsTowardGoal,
    ).toBe(false)
  })

  it('does not treat a completion with no timestamp as a pre-join rewatch', () => {
    expect(
      deriveMembershipChallengeFields({
        addedAt,
        challenge: challenge({ includeRewatches: true }),
        libraryItem: libraryItem({ completedAt: null, rewatchCount: 2 }),
        media: movie,
      }).countsTowardGoal,
    ).toBe(false)
  })

  it('does not treat an in-progress title as a pre-join rewatch', () => {
    expect(
      deriveMembershipChallengeFields({
        addedAt,
        challenge: challenge(),
        libraryItem: libraryItem({ completedAt: null, rewatchCount: 2, status: 'watching' }),
        media: movie,
      }).countsTowardGoal,
    ).toBe(true)
  })
})

describe('excludeFromGoal', () => {
  it('turns counts off when the rules would otherwise include the title', () => {
    expect(
      deriveMembershipChallengeFields({
        addedAt,
        challenge: challenge(),
        excludeFromGoal: true,
        libraryItem: libraryItem(),
        media: movie,
      }),
    ).toMatchObject({ countsTowardGoal: false, listStatus: 'planned' })
  })

  it('stays off when the rules already exclude the title', () => {
    expect(
      deriveMembershipChallengeFields({
        addedAt,
        challenge: challenge(),
        excludeFromGoal: false,
        libraryItem: libraryItem({ completedAt: completedBefore, rewatchCount: 0 }),
        media: movie,
      }).countsTowardGoal,
    ).toBe(false)

    expect(
      deriveMembershipChallengeFields({
        addedAt,
        challenge: challenge(),
        excludeFromGoal: true,
        libraryItem: libraryItem({ completedAt: completedBefore, rewatchCount: 0 }),
        media: movie,
      }).countsTowardGoal,
    ).toBe(false)
  })

  it('counts the title when the manual exclusion is cleared and the rules pass', () => {
    expect(
      deriveMembershipChallengeFields({
        addedAt,
        challenge: challenge(),
        excludeFromGoal: false,
        libraryItem: libraryItem(),
        media: movie,
      }).countsTowardGoal,
    ).toBe(true)
  })
})

describe('getChallengeExclusion', () => {
  it('explains a series rejected by the movies-only rule', () => {
    expect(
      getChallengeExclusion({
        addedAt,
        challenge: challenge({ tvCountRule: 'movies_only' }),
        libraryItem: libraryItem(),
        media: series,
      }),
    ).toEqual({ badge: null, note: 'Series — excluded per challenge rules' })
  })

  it('explains a prior completion that was not rewatched', () => {
    expect(
      getChallengeExclusion({
        addedAt,
        challenge: challenge(),
        libraryItem: libraryItem({ completedAt: completedBefore, rewatchCount: 0 }),
        media: movie,
      }),
    ).toEqual({ badge: null, note: 'Already completed — excluded per challenge rules' })
  })

  it('explains a pre-join rewatch and flags it when rewatches are excluded', () => {
    expect(
      getChallengeExclusion({
        addedAt,
        challenge: challenge(),
        libraryItem: libraryItem({ completedAt: completedBefore, rewatchCount: 1 }),
        media: movie,
      }),
    ).toEqual({ badge: 'rewatch', note: 'Rewatch — excluded per challenge rules' })
  })

  it('prefers the series note when the TV rule and the rewatch rule both fail', () => {
    expect(
      getChallengeExclusion({
        addedAt,
        challenge: challenge({ tvCountRule: 'movies_only' }),
        libraryItem: libraryItem({ completedAt: completedBefore, rewatchCount: 2 }),
        media: series,
      }),
    ).toEqual({ badge: null, note: 'Series — excluded per challenge rules' })
  })

  it('has no rule note when includeRewatches lets the rewatch count', () => {
    expect(
      getChallengeExclusion({
        addedAt,
        challenge: challenge({ includeRewatches: true }),
        libraryItem: libraryItem({ completedAt: completedBefore, rewatchCount: 1 }),
        media: movie,
      }),
    ).toEqual({ badge: null, note: null })
  })

  it('has no rule note for a manual exclusion the member can turn back on', () => {
    const input = {
      addedAt,
      challenge: challenge(),
      libraryItem: libraryItem(),
      media: movie,
    }

    expect(getChallengeExclusion(input)).toEqual({ badge: null, note: null })
    expect(
      deriveMembershipChallengeFields({ ...input, excludeFromGoal: true }).countsTowardGoal,
    ).toBe(false)
  })

  it('keeps the already-completed note when challenge mode is off', () => {
    expect(
      getChallengeExclusion({
        addedAt,
        libraryItem: libraryItem({ completedAt: completedBefore, rewatchCount: 1 }),
        media: movie,
      }),
    ).toEqual({ badge: null, note: 'Already completed — excluded per challenge rules' })
  })
})

describe('disabled challenge', () => {
  it('ignores stored TV and goal rules once challenge mode is off', () => {
    expect(
      deriveMembershipChallengeFields({
        addedAt,
        challenge: challenge({ enabled: false, tvCountRule: 'movies_only' }),
        libraryItem: libraryItem(),
        media: series,
      }),
    ).toMatchObject({ countsTowardGoal: true, goalWeight: 1, listStatus: 'completed' })
  })

  it('does not report a series as excluded when challenge mode is off', () => {
    expect(
      getChallengeExclusion({
        addedAt,
        challenge: challenge({ enabled: false, tvCountRule: 'movies_only' }),
        libraryItem: libraryItem(),
        media: series,
      }),
    ).toEqual({ badge: null, note: null })
  })
})
