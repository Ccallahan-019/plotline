import type { AccessArgs } from 'payload'

import { isAdmin, isOwner } from '@/access'

export const watchEventsAccess = {
  create: isOwner('profile', 'watch-events'),
  delete: async (args: AccessArgs) => {
    const ownerResult = await isOwner('profile', 'watch-events')(args)

    if (ownerResult === true) {
      return true
    }

    return isAdmin({ req: args.req })
  },
  read: isOwner('profile', 'watch-events'),
  update: ({ req }: AccessArgs) => isAdmin({ req }),
}
