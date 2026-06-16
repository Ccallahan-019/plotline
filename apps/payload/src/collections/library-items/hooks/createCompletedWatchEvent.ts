import type { CollectionAfterChangeHook } from 'payload'

import { SKIP_COMPLETED_WATCH_EVENT } from '../context'

export const createCompletedWatchEvent: CollectionAfterChangeHook = async ({
  context,
  doc,
  operation,
  previousDoc,
  req,
}) => {
  req.context ??= {}

  if (context[SKIP_COMPLETED_WATCH_EVENT] || req.context[SKIP_COMPLETED_WATCH_EVENT]) {
    return doc
  }

  if (operation !== 'update' || doc.status !== 'completed' || previousDoc?.status === 'completed') {
    return doc
  }

  await req.payload.create({
    collection: 'watch-events',
    data: {
      eventType: 'completed',
      libraryItem: doc.id,
      media: doc.media,
      profile: doc.profile,
      visibility: 'private',
      watchedAt: doc.completedAt ?? new Date().toISOString(),
    },
    overrideAccess: true,
    req,
  })

  return doc
}
