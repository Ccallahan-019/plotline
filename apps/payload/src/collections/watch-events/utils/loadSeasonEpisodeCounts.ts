import type { Media } from '@plotline/payload-types'
import type { PayloadRequest } from 'payload'

/**
 * Stored per-season lengths for a locked TV progress update.
 *
 * This is a local media read. Progress sync must not call TMDB under the row lock, and a
 * missing `tvMeta` leaves `seasonsCompleted` to be copied through rather than guessed.
 *
 * @param req - Payload request (uses the open transaction when present)
 * @param mediaId - Media row whose `tvMeta.seasonEpisodeCounts` to read
 * @returns Season lengths, or `undefined` when the media row has no TV metadata
 */
export async function loadSeasonEpisodeCounts(
  req: PayloadRequest,
  mediaId: number,
): Promise<NonNullable<Media['tvMeta']>['seasonEpisodeCounts'] | undefined> {
  const media = await req.payload.findByID({
    collection: 'media',
    depth: 0,
    id: mediaId,
    overrideAccess: true,
    req,
  })

  return media?.tvMeta?.seasonEpisodeCounts
}
