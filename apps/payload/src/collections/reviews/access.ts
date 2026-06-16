import { isOwner } from '@/access'

export const reviewsAccess = {
  create: isOwner('profile', 'reviews'),
  delete: isOwner('profile', 'reviews'),
  read: isOwner('profile', 'reviews'),
  update: isOwner('profile', 'reviews'),
}
