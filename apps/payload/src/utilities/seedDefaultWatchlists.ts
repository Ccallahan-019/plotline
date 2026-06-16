import type { Payload, PayloadRequest } from 'payload'

const DEFAULT_WATCHLISTS = [
  {
    isDefault: true,
    isSystem: true,
    name: 'Watchlist',
    slug: 'watchlist',
    sortOrder: 0,
  },
  {
    isDefault: true,
    isSystem: true,
    name: 'Currently Watching',
    slug: 'currently-watching',
    sortOrder: 1,
  },
] as const

export async function seedDefaultWatchlists(
  payload: Payload,
  profileId: number,
  req: PayloadRequest,
): Promise<void> {
  await Promise.all(
    DEFAULT_WATCHLISTS.map((list) =>
      payload.create({
        collection: 'watchlists',
        data: {
          ...list,
          owner: profileId,
          visibility: 'private',
        },
        overrideAccess: true,
        req,
      }),
    ),
  )
}
