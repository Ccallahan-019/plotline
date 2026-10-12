import type { StatsLibraryItem, StatsMedia, WatchlistChallengeConfig } from './types'

import { resolveMembershipRuleEligibility } from './membershipFields'

export type ChallengeExclusion = {
  /** Set when the disabled checkbox is a rewatch the challenge does not count. */
  badge: 'rewatch' | null
  /** Rule note for a disabled Counts checkbox. Manual exclusion leaves this null. */
  note: null | string
}

/**
 * Why a challenge Counts checkbox is disabled.
 *
 * TV rules win, then a pre-join rewatch while rewatches are excluded, then a prior completion
 * the challenge does not count. Manual `excludeFromGoal` is not a rule failure: when the
 * rules still allow the title, `note` stays null so the checkbox can be turned back on.
 * A qualifying rewatch (`includeRewatches`) is not reported as already completed.
 *
 * @param input.addedAt - When the title joined the list
 * @param input.challenge - Watchlist challenge config
 * @param input.libraryItem - Library status, completion time, and rewatch count
 * @param input.media - Media type used by the TV counting rule
 * @returns The note beside a disabled checkbox, plus a rewatch badge when that is the reason
 */
export function getChallengeExclusion(input: {
  addedAt: string
  challenge?: null | WatchlistChallengeConfig
  libraryItem: StatsLibraryItem
  media: StatsMedia
}): ChallengeExclusion {
  const eligibility = resolveMembershipRuleEligibility(input)

  if (eligibility.ruleEligible) {
    return { badge: null, note: null }
  }

  if (!eligibility.tvEligible) {
    // `movies_only` is the TV rule that rejects a title, and it rejects series.
    return { badge: null, note: 'Series — excluded per challenge rules' }
  }

  if (
    eligibility.preJoinRewatch &&
    input.challenge?.enabled === true &&
    input.challenge.includeRewatches !== true
  ) {
    return { badge: 'rewatch', note: 'Rewatch — excluded per challenge rules' }
  }

  if (!eligibility.priorEligible) {
    return { badge: null, note: 'Already completed — excluded per challenge rules' }
  }

  return { badge: null, note: null }
}
