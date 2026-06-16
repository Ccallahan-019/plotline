import { User } from '@/payload-types'

export function hasAdminRole(user: null | undefined | User): boolean {
  const roles = user?.roles

  return Array.isArray(roles) && roles.includes('admin')
}
