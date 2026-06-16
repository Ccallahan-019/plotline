import type { CollectionAfterChangeHook } from 'payload'

import { seedDefaultWatchlists } from '../../../utilities/seedDefaultWatchlists'

export const seedDefaultWatchlistsOnCreate: CollectionAfterChangeHook = async ({
  doc,
  operation,
  req,
}) => {
  if (operation !== 'create') {
    return doc
  }

  await seedDefaultWatchlists(req.payload, doc.id)

  return doc
}
