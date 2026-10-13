import type { LibraryItem, Media, WatchlistMembership } from '@plotline/payload-types'
import type { Endpoint, PayloadRequest } from 'payload'

import {
  deriveMembershipChallengeFields,
  getChallengeExclusion,
  type WatchlistChallengeConfig,
} from '@plotline/shared/watchlist-stats'

import { withLibraryItemRowLock } from '../collections/watch-events/utils/withLibraryItemRowLock'
import {
  clearWatchlistSyncSkipFlags,
  SKIP_WATCHLIST_STATS_RECALC,
} from '../collections/watchlists/context'
import { recalculateWatchlistStatsById } from '../utilities/recalculateWatchlistStatsById'
import { getRelationId } from '../utilities/relations'
import { runInPayloadTransaction } from '../utilities/runInPayloadTransaction'
import { findOwnedWatchlistBySlug } from './find-owned-watchlist-by-slug'
import { parseJsonBody, requireProfileContext, requireServiceAuth } from './helpers'
import { readMembershipId, readWatchlistSlug } from './watchlist-route-params'

const PATCH_FIELDS = new Set(['excludeFromGoal'])

type ExcludeFromGoalPatch = {
  excludeFromGoal: boolean
}

/**
 * Sets whether one membership counts toward its watchlist goal.
 *
 * `PATCH /api/watchlists/:slug/memberships/:membershipId` accepts
 * `{ excludeFromGoal: boolean }` and rewrites the derived challenge fields.
 * Turning counts on (`excludeFromGoal: false`) is rejected when the challenge
 * rules already exclude the title. Turning counts off is always allowed.
 * `excludeFromGoal` is what later library sync and challenge re-derives keep.
 * Stats are recalculated once after the row write. The reads and the write run in one
 * transaction under the library item's row lock, the same lock log-watch takes.
 *
 * The path is relative to the `watchlists` collection. A root path starting
 * with `/watchlists` is never reached, because Payload routes that prefix to
 * the collection's own endpoints.
 */
export const updateWatchlistMembershipEndpoint: Endpoint = {
  handler: async (req: PayloadRequest) => {
    const unauthorized = await requireServiceAuth(req)

    if (unauthorized) {
      return unauthorized
    }

    const profileResult = await requireProfileContext(req)

    if (profileResult instanceof Response) {
      return profileResult
    }

    const slug = readWatchlistSlug(req)

    if (!slug) {
      return Response.json({ error: 'Watchlist slug is required' }, { status: 400 })
    }

    const membershipId = readMembershipId(req)

    if (membershipId === null) {
      return Response.json({ error: 'Membership id is required' }, { status: 400 })
    }

    const body = await parseJsonBody<unknown>(req)

    if (body instanceof Response) {
      return body
    }

    const patch = parseExcludeFromGoalPatch(body)

    if (patch instanceof Response) {
      return patch
    }

    const watchlist = await findOwnedWatchlistBySlug(req, profileResult.profileId, slug)

    if (!watchlist) {
      return Response.json({ error: 'Watchlist not found' }, { status: 404 })
    }

    const challenge = watchlist.challenge as null | undefined | WatchlistChallengeConfig

    const lookup = await findWatchlistMembership(req, watchlist.id, membershipId, 0)

    if (!lookup) {
      return Response.json({ error: 'Membership not found' }, { status: 404 })
    }

    const libraryItemId = getRelationId(lookup.libraryItem)

    if (libraryItemId == null) {
      return Response.json({ error: 'Membership library item is missing' }, { status: 400 })
    }

    req.context ??= {}

    // Reads and the write share one transaction under the library item's row lock, so a
    // concurrent log-watch or status change cannot land between deriving and storing.
    const result = await runInPayloadTransaction(req, () =>
      withLibraryItemRowLock(req, libraryItemId, async () => {
        const membership = await findWatchlistMembership(req, watchlist.id, membershipId, 2)

        if (!membership) {
          return Response.json({ error: 'Membership not found' }, { status: 404 })
        }

        const libraryItem = await resolveLibraryItem(req, membership.libraryItem)
        const media = libraryItem ? await resolveMedia(req, libraryItem.media) : null

        if (!libraryItem || !media) {
          return Response.json({ error: 'Membership library item is missing' }, { status: 400 })
        }

        const libraryStats = {
          completedAt: libraryItem.completedAt,
          progress: libraryItem.progress,
          rewatchCount: libraryItem.rewatchCount,
          status: libraryItem.status,
        }
        const mediaStats = {
          mediaType: media.mediaType,
          runtime: media.runtime,
          tvMeta: media.tvMeta,
        }

        if (!patch.excludeFromGoal) {
          const exclusion = getChallengeExclusion({
            addedAt: membership.addedAt,
            challenge,
            libraryItem: libraryStats,
            media: mediaStats,
          })

          if (exclusion.note) {
            return Response.json({ error: exclusion.note }, { status: 400 })
          }
        }

        const episodesWatched = libraryItem.progress?.episodesWatched ?? 0
        const episodesAtJoin =
          membership.episodesAtJoin ??
          Math.max(0, episodesWatched - (membership.episodesCountedForList ?? 0))
        const derived = deriveMembershipChallengeFields({
          addedAt: membership.addedAt,
          challenge,
          episodesAtJoin,
          excludeFromGoal: patch.excludeFromGoal,
          libraryItem: libraryStats,
          media: mediaStats,
        })

        const doc = await req.payload.update({
          collection: 'watchlist-memberships',
          context: {
            [SKIP_WATCHLIST_STATS_RECALC]: true,
          },
          data: membershipChallengeUpdate({
            derived,
            episodesAtJoin,
            excludeFromGoal: patch.excludeFromGoal,
            libraryItem,
            membership,
          }),
          depth: 0,
          id: membership.id,
          overrideAccess: true,
          req,
        })

        clearWatchlistSyncSkipFlags(req.context)
        await recalculateWatchlistStatsById(req.payload, watchlist.id, req)

        return doc
      }),
    )

    if (result instanceof Response) {
      return result
    }

    return Response.json(result)
  },
  method: 'patch',
  path: '/:slug/memberships/:membershipId',
}

// One membership of the watchlist, or `undefined` when it is not on that list.
async function findWatchlistMembership(
  req: PayloadRequest,
  watchlistId: number,
  membershipId: number,
  depth: 0 | 2,
): Promise<undefined | WatchlistMembership> {
  const result = await req.payload.find({
    collection: 'watchlist-memberships',
    depth,
    limit: 1,
    overrideAccess: true,
    req,
    where: {
      and: [{ id: { equals: membershipId } }, { watchlist: { equals: watchlistId } }],
    },
  })

  return result.docs[0]
}

/**
 * Challenge fields to store after `excludeFromGoal` changes.
 *
 * A skipped row keeps that status. Other rows take the derived status, and a
 * new completion copies the library completion time.
 *
 * @param input.derived - Fields from `deriveMembershipChallengeFields`
 * @param input.episodesAtJoin - Episode baseline to keep on the row
 * @param input.excludeFromGoal - Manual opt-out from the request
 * @param input.libraryItem - Source of the completion time
 * @param input.membership - Row being updated
 * @returns Data for the membership update
 */
function membershipChallengeUpdate(input: {
  derived: ReturnType<typeof deriveMembershipChallengeFields>
  episodesAtJoin: number
  excludeFromGoal: boolean
  libraryItem: LibraryItem
  membership: WatchlistMembership
}): Record<string, unknown> {
  const updateData: Record<string, unknown> = {
    countsTowardGoal: input.derived.countsTowardGoal,
    episodesAtJoin: input.episodesAtJoin,
    episodesCountedForList: input.derived.episodesCountedForList,
    excludeFromGoal: input.excludeFromGoal,
    goalWeight: input.derived.goalWeight,
  }

  if (input.membership.listStatus === 'skipped') {
    return updateData
  }

  updateData.listStatus = input.derived.listStatus

  if (input.derived.listStatus === 'completed' && input.membership.listStatus !== 'completed') {
    updateData.completedForListAt = input.libraryItem.completedAt ?? new Date().toISOString()
  }

  return updateData
}

/**
 * Accepts a membership patch of `excludeFromGoal`.
 *
 * The flag is required and must be a boolean. Any other field is rejected so
 * list status, goal weight, and the library link cannot be changed from this route.
 *
 * @param body - Parsed JSON body
 * @returns The flag to store, or a 400 response
 */
function parseExcludeFromGoalPatch(body: unknown): ExcludeFromGoalPatch | Response {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return Response.json({ error: 'Request body must be an object' }, { status: 400 })
  }

  const record = body as Record<string, unknown>
  const keys = Object.keys(record)

  if (keys.some((key) => !PATCH_FIELDS.has(key))) {
    return Response.json({ error: 'Only excludeFromGoal can be updated' }, { status: 400 })
  }

  if (typeof record.excludeFromGoal !== 'boolean') {
    return Response.json({ error: 'excludeFromGoal must be a boolean' }, { status: 400 })
  }

  return { excludeFromGoal: record.excludeFromGoal }
}

// Uses the populated library item, or loads it when the membership find did not.
async function resolveLibraryItem(
  req: PayloadRequest,
  libraryItem: WatchlistMembership['libraryItem'],
): Promise<LibraryItem | null> {
  if (typeof libraryItem === 'object') {
    return libraryItem
  }

  return req.payload.findByID({
    collection: 'library-items',
    depth: 1,
    id: libraryItem,
    overrideAccess: true,
    req,
  })
}

// Uses populated media, or loads it when the library item only has an id.
async function resolveMedia(
  req: PayloadRequest,
  media: LibraryItem['media'],
): Promise<Media | null> {
  if (typeof media === 'object') {
    return media
  }

  return req.payload.findByID({
    collection: 'media',
    depth: 0,
    id: media,
    overrideAccess: true,
    req,
  })
}
