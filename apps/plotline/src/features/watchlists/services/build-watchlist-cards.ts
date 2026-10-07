import type { LibraryItem, Watchlist, WatchlistMembership } from '@plotline/payload-types'

import type { WatchlistCard, WatchlistCardPreview, WatchlistCardSort } from '../types'

import { DEFAULT_WATCHLIST_CARD_SORT } from '../types'

export const WATCHLIST_CARD_PREVIEW_LIMIT = 3

export type BuildWatchlistCardsInput = {
  libraryItems: readonly LibraryItem[]
  memberships: readonly WatchlistMembership[]
  /** Full membership count per watchlist id. Falls back to the supplied memberships when absent. */
  titleCounts?: ReadonlyMap<number, number>
  watchlists: readonly Watchlist[]
}

/**
 * Builds card rows from watchlists, ordered memberships, and preview library items.
 *
 * Memberships must already be ordered by `sortOrder`, then `addedAt`, and may be
 * only the first few per watchlist. `titleCount` comes from `titleCounts` when
 * given, otherwise from the supplied memberships. `previews` is the first three
 * titles; a missing library item or poster stays in its slot with a null poster.
 * Card order follows `watchlists`, not name.
 *
 * @param input.libraryItems - Preview titles fetched at depth 1. Posters are read from these, not from membership relations
 * @param input.memberships - Memberships for the loaded watchlists, in list order
 * @param input.titleCounts - Full membership count per watchlist id, when `memberships` is truncated
 * @param input.watchlists - Watchlists to emit, in the order the caller wants preserved
 * @returns One card per watchlist
 */
export function buildWatchlistCards({
  libraryItems,
  memberships,
  titleCounts,
  watchlists,
}: BuildWatchlistCardsInput): WatchlistCard[] {
  const grouped = membershipsByWatchlistId(memberships)
  const itemsById = indexLibraryItems(libraryItems)

  return watchlists.map((watchlist) => {
    const group = grouped.get(watchlist.id) ?? []
    const previews = group
      .slice(0, WATCHLIST_CARD_PREVIEW_LIMIT)
      .map((membership) =>
        toWatchlistCardPreview(itemsById.get(relationshipId(membership.libraryItem))),
      )

    return {
      createdAt: watchlist.createdAt,
      description: toCardDescription(watchlist.description),
      id: watchlist.id,
      name: watchlist.name,
      previews,
      slug: watchlist.slug,
      titleCount: titleCounts?.get(watchlist.id) ?? group.length,
      updatedAt: watchlist.updatedAt,
      visibility: watchlist.visibility,
    }
  })
}

/**
 * Library item ids for the first three memberships of each watchlist.
 *
 * Memberships must already be ordered by `sortOrder`, then `addedAt`. Ids are
 * de-duplicated so one library-item query can load every poster.
 *
 * @param watchlists - Watchlists whose previews should be loaded
 * @param memberships - Memberships in list order
 * @returns Unique library item ids, in first-seen preview order
 */
export function collectPreviewLibraryItemIds(
  watchlists: readonly Pick<Watchlist, 'id'>[],
  memberships: readonly WatchlistMembership[],
): number[] {
  const grouped = membershipsByWatchlistId(memberships)
  const ids: number[] = []
  const seen = new Set<number>()

  for (const watchlist of watchlists) {
    const group = grouped.get(watchlist.id) ?? []

    for (const membership of group.slice(0, WATCHLIST_CARD_PREVIEW_LIMIT)) {
      const libraryItemId = relationshipId(membership.libraryItem)

      if (!seen.has(libraryItemId)) {
        seen.add(libraryItemId)
        ids.push(libraryItemId)
      }
    }
  }

  return ids
}

/**
 * Returns a new array of cards in the requested order.
 *
 * Name sorts are case-insensitive. Ties fall back to name, then id, so equal
 * values stay stable. The default is name A–Z.
 *
 * @param cards - Cards to sort. This array is not modified
 * @param sort - Sort mode. Defaults to name A–Z
 * @returns A new sorted array
 */
export function sortWatchlistCards(
  cards: readonly WatchlistCard[],
  sort: WatchlistCardSort = DEFAULT_WATCHLIST_CARD_SORT,
): WatchlistCard[] {
  return [...cards].sort((left, right) => compareWatchlistCards(left, right, sort))
}

// Primary name order, ignoring case.
function compareNames(left: WatchlistCard, right: WatchlistCard): number {
  return left.name.localeCompare(right.name, 'en', { sensitivity: 'base' })
}

// Sort comparator. Name, then id, breaks ties.
function compareWatchlistCards(
  left: WatchlistCard,
  right: WatchlistCard,
  sort: WatchlistCardSort,
): number {
  const byId = left.id - right.id
  const byName = compareNames(left, right)

  switch (sort) {
    case 'most-titles':
      return right.titleCount - left.titleCount || byName || byId
    case 'name-asc':
      return byName || byId
    case 'name-desc':
      return compareNames(right, left) || byId
    case 'newest':
      return right.createdAt.localeCompare(left.createdAt) || byName || byId
    case 'recently-updated':
      return right.updatedAt.localeCompare(left.updatedAt) || byName || byId
    default: {
      const exhaustive: never = sort
      return exhaustive
    }
  }
}

// Last item wins if the same id appears twice.
function indexLibraryItems(libraryItems: readonly LibraryItem[]): Map<number, LibraryItem> {
  const indexed = new Map<number, LibraryItem>()

  for (const libraryItem of libraryItems) {
    indexed.set(libraryItem.id, libraryItem)
  }

  return indexed
}

// Groups memberships without changing their relative order.
function membershipsByWatchlistId(
  memberships: readonly WatchlistMembership[],
): Map<number, WatchlistMembership[]> {
  const grouped = new Map<number, WatchlistMembership[]>()

  for (const membership of memberships) {
    const watchlistId = relationshipId(membership.watchlist)
    const group = grouped.get(watchlistId)

    if (group) {
      group.push(membership)
    } else {
      grouped.set(watchlistId, [membership])
    }
  }

  return grouped
}

// Depth 0 relations are ids. Populated documents still expose `id`.
function relationshipId(value: { id: number } | number): number {
  return typeof value === 'number' ? value : value.id
}

// Blank copy becomes null so the card can show an empty description.
function toCardDescription(description: null | string | undefined): null | string {
  if (description == null || description.trim().length === 0) {
    return null
  }

  return description
}

// A missing item or poster still occupies a preview slot.
function toWatchlistCardPreview(libraryItem: LibraryItem | undefined): WatchlistCardPreview {
  if (!libraryItem || typeof libraryItem.media !== 'object') {
    return { posterPath: null, title: '' }
  }

  const posterPath = libraryItem.media.posterPath?.trim()

  return {
    posterPath: posterPath ? posterPath : null,
    title: libraryItem.media.title,
  }
}
