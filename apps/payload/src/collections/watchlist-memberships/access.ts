import { isWatchlistMembershipOwner } from '@/access'

export const watchlistMembershipsAccess = {
  create: isWatchlistMembershipOwner,
  delete: isWatchlistMembershipOwner,
  read: isWatchlistMembershipOwner,
  update: isWatchlistMembershipOwner,
}
