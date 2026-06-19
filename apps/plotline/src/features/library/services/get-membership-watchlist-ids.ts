import type { WatchlistMembership } from "@plotline/payload-types";

export function getMembershipWatchlistIds(
  memberships: WatchlistMembership[],
): Set<number> {
  const watchlistIds = new Set<number>();

  for (const membership of memberships) {
    const watchlistId =
      typeof membership.watchlist === "object"
        ? membership.watchlist.id
        : membership.watchlist;

    watchlistIds.add(watchlistId);
  }

  return watchlistIds;
}
