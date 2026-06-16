import { isOwner } from '@/access'

export const libraryItemsAccess = {
  create: isOwner('profile', 'library-items'),
  delete: isOwner('profile', 'library-items'),
  read: isOwner('profile', 'library-items'),
  update: isOwner('profile', 'library-items'),
}
