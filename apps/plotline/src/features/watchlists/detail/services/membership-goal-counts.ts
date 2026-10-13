import type { Watchlist, WatchlistMembership } from '@plotline/payload-types'
import type { ChallengeExclusion } from '@plotline/shared/watchlist-stats'

import { getChallengeExclusion } from '@plotline/shared/watchlist-stats'

import { getMembershipLibraryItem, getMembershipMedia } from './membership-media'

export type MembershipGoalCounts = Pick<
  WatchlistMembership,
  'countsTowardGoal' | 'episodesCountedForList' | 'excludeFromGoal' | 'goalWeight' | 'listStatus'
>

/**
 * Writes goal-count fields onto one membership and leaves populated relations in place.
 *
 * The membership PATCH returns depth 0, so replacing the row would drop the
 * library item and media the list is rendering.
 *
 * @param memberships - Cached detail rows
 * @param membershipId - Row to update
 * @param counts - Fields from the optimistic write or the PATCH response
 * @returns The list with that row's goal fields replaced
 */
export function applyMembershipGoalCounts(
  memberships: readonly WatchlistMembership[],
  membershipId: number,
  counts: MembershipGoalCounts,
): WatchlistMembership[] {
  return memberships.map((membership) =>
    membership.id === membershipId ? { ...membership, ...counts } : membership,
  )
}

/**
 * Rule note for a membership's Counts checkbox.
 *
 * Missing library or media leaves the note unset, so the checkbox stays enabled.
 * Turning counts off is always allowed, and the server rejects turning it on
 * when the rules exclude the title.
 *
 * @param membership - Detail row, with library item and media populated when known
 * @param challenge - Challenge config from the watchlist
 * @returns The exclusion note and rewatch badge, or null when relations are missing
 */
export function getMembershipChallengeExclusion(
  membership: WatchlistMembership,
  challenge: null | undefined | Watchlist['challenge'],
): ChallengeExclusion | null {
  const libraryItem = getMembershipLibraryItem(membership)
  const media = getMembershipMedia(membership)

  if (!libraryItem || !media) {
    return null
  }

  return getChallengeExclusion({
    addedAt: membership.addedAt,
    challenge,
    libraryItem: {
      completedAt: libraryItem.completedAt,
      progress: libraryItem.progress,
      rewatchCount: libraryItem.rewatchCount,
      status: libraryItem.status,
    },
    media: {
      mediaType: media.mediaType,
      runtime: media.runtime,
      tvMeta: media.tvMeta ? { episodeCount: media.tvMeta.episodeCount } : null,
    },
  })
}

/**
 * Goal fields copied off a membership, including a depth-0 PATCH response.
 *
 * @param membership - Cached row or the membership returned by the update
 * @returns The goal fields safe to merge onto a populated cache row
 */
export function membershipGoalCountsFrom(membership: WatchlistMembership): MembershipGoalCounts {
  return {
    countsTowardGoal: membership.countsTowardGoal,
    episodesCountedForList: membership.episodesCountedForList,
    excludeFromGoal: membership.excludeFromGoal,
    goalWeight: membership.goalWeight,
    listStatus: membership.listStatus,
  }
}

/**
 * Goal fields to show immediately after the Counts checkbox changes.
 *
 * Unchecking always clears `countsTowardGoal`. Checking sets it only when the
 * challenge rules still include the title, so a rule exclusion stays unchecked.
 *
 * @param membership - Row being toggled
 * @param challenge - Challenge config used for the exclusion note
 * @param excludeFromGoal - Next manual opt-out. `true` keeps the title out of the goal
 * @returns Goal fields to write onto that cached row
 */
export function optimisticMembershipGoalCounts(
  membership: WatchlistMembership,
  challenge: null | undefined | Watchlist['challenge'],
  excludeFromGoal: boolean,
): MembershipGoalCounts {
  const exclusion = getMembershipChallengeExclusion(membership, challenge)

  return {
    countsTowardGoal: !excludeFromGoal && exclusion?.note == null,
    episodesCountedForList: membership.episodesCountedForList,
    excludeFromGoal,
    goalWeight: membership.goalWeight,
    listStatus: membership.listStatus,
  }
}

/**
 * Puts one row's goal fields back after a failed Counts update.
 *
 * Other rows keep their current fields, so a counts change or reorder that
 * landed on a different title is not undone. A row removed while the request
 * was in flight stays removed.
 *
 * @param current - Memberships in the cache now
 * @param previous - Memberships from before this update
 * @param membershipId - Row whose goal fields should revert
 * @returns `current` with that row's goal fields restored
 */
export function restoreMembershipGoalCounts(
  current: readonly WatchlistMembership[],
  previous: readonly WatchlistMembership[],
  membershipId: number,
): WatchlistMembership[] {
  const previousRow = previous.find((membership) => membership.id === membershipId)

  if (!previousRow) {
    return [...current]
  }

  return applyMembershipGoalCounts(current, membershipId, membershipGoalCountsFrom(previousRow))
}
