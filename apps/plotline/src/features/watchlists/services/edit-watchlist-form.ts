import type { Watchlist } from '@plotline/payload-types'

import {
  VISIBILITIES,
  WATCHLIST_DESCRIPTION_MAX_LENGTH,
  WATCHLIST_NAME_MAX_LENGTH,
} from '@plotline/shared/constants'
import { z } from 'zod'

import type { UpdateWatchlistInput } from '../types'

export const editWatchlistFormSchema = z.object({
  description: z
    .string()
    .trim()
    .max(
      WATCHLIST_DESCRIPTION_MAX_LENGTH,
      `Description must be ${WATCHLIST_DESCRIPTION_MAX_LENGTH} characters or fewer`,
    ),
  name: z
    .string()
    .trim()
    .min(1, 'Enter a name')
    .max(
      WATCHLIST_NAME_MAX_LENGTH,
      `Name must be ${WATCHLIST_NAME_MAX_LENGTH} characters or fewer`,
    ),
  visibility: z.enum(VISIBILITIES),
})

export type EditWatchlistFormValues = z.infer<typeof editWatchlistFormSchema>

/**
 * Form defaults for the watchlist details dialog.
 *
 * A missing description becomes an empty string so the textarea stays controlled.
 *
 * @param watchlist - Watchlist whose details fill the form
 * @returns Name, description, and visibility for the form
 */
export function toEditWatchlistFormValues(
  watchlist: Pick<Watchlist, 'description' | 'name' | 'visibility'>,
): EditWatchlistFormValues {
  return {
    description: watchlist.description?.trim() ?? '',
    name: watchlist.name,
    visibility: watchlist.visibility,
  }
}

/**
 * Maps submitted form values to the watchlist update payload.
 *
 * Trims both text fields. A blank description is sent as `null` so the stored
 * description is cleared.
 *
 * @param values - Submitted form values
 * @returns Name, description, and visibility ready for the update API
 */
export function toUpdateWatchlistInput(values: EditWatchlistFormValues): UpdateWatchlistInput {
  const description = values.description.trim()

  return {
    description: description.length === 0 ? null : description,
    name: values.name.trim(),
    visibility: values.visibility,
  }
}
