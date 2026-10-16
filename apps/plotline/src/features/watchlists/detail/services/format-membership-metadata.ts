import type { Media } from '@plotline/payload-types'

import { formatReleaseYear } from '@/features/media-grid/grid/services/media-display-helpers'

/**
 * Second metadata line for a membership row: when the title was added.
 *
 * @param addedAt - Membership `addedAt` timestamp
 * @returns `Added to list …`, or `null` when `addedAt` cannot be parsed
 */
export function formatAddedToListLabel(addedAt: string): null | string {
  const addedLabel = formatAddedToListDate(addedAt)

  return addedLabel ? `Added ${addedLabel}` : null
}

/**
 * Metadata line under a membership title.
 *
 * Joins the media label and the added date with a middle dot. Returns `null`
 * when both parts are missing so the row can skip an empty description.
 *
 * @param mediaLabel - Year and Film/Series, or `null`
 * @param addedLabel - Added date, or `null`
 * @returns The joined line, or `null` when there is nothing to show
 */
export function formatMembershipDescription(
  mediaLabel: null | string,
  addedLabel: null | string,
): null | string {
  const description = [mediaLabel, addedLabel]
    .filter((label): label is string => label != null && label.length > 0)
    .join(' · ')

  return description.length > 0 ? description : null
}

/**
 * First metadata line for a membership row: release year and Film/Series.
 *
 * A missing year is omitted. Returns `null` when media was not populated.
 *
 * @param media - Populated media, or `null` when the row has no title metadata
 * @returns A middle-dot separated line, or `null` when there is nothing to show
 */
export function formatMembershipMediaLabel(media: Media | null): null | string {
  if (!media) {
    return null
  }

  const parts = [
    formatReleaseYear(media.releaseDate),
    media.mediaType === 'movie' ? 'Film' : 'Series',
  ]

  return parts.filter((part): part is string => part != null && part.length > 0).join(' · ')
}

// Localized medium date, or `null` when `addedAt` cannot be parsed.
function formatAddedToListDate(addedAt: string): null | string {
  const date = new Date(addedAt)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date)
}
