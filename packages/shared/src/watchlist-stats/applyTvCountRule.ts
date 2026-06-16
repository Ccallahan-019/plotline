import type { TvCountRule } from "../constants/watchlist-challenge";
import type { StatsMembershipInput } from "./types";

export function filterMembershipsByTvRule(
  memberships: StatsMembershipInput[],
  tvCountRule: null | TvCountRule | undefined,
): StatsMembershipInput[] {
  return memberships.filter((membership) =>
    isMembershipEligibleForTvRule(membership, tvCountRule),
  );
}

export function isMembershipEligibleForTvRule(
  membership: StatsMembershipInput,
  tvCountRule: null | TvCountRule | undefined,
): boolean {
  if (membership.media.mediaType !== "tv") {
    return true;
  }

  const rule = tvCountRule ?? "tv_as_series";

  return rule !== "movies_only";
}
