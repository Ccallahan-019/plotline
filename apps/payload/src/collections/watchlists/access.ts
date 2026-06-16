import { isOwner } from '@/access'

export const watchlistsAccess = {
  create: isOwner('owner', 'watchlists'),
  delete: isOwner('owner', 'watchlists'),
  read: isOwner('owner', 'watchlists'),
  update: isOwner('owner', 'watchlists'),
}
