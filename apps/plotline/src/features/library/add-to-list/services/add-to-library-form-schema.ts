import { MEDIA_STATUSES } from '@plotline/shared/constants/media'
import { z } from 'zod'

export const addToLibraryFormValuesSchema = z.object({
  note: z.string(),
  status: z.enum(MEDIA_STATUSES),
  watchlistIds: z.array(z.number()),
})

export type AddToLibraryFormValues = z.infer<typeof addToLibraryFormValuesSchema>

export function createAddToLibraryFormSchema(disabledWatchlistIds: Set<number>) {
  return addToLibraryFormValuesSchema.superRefine((values, ctx) => {
    const selectableWatchlistIds = values.watchlistIds.filter(
      (watchlistId) => !disabledWatchlistIds.has(watchlistId),
    )

    if (selectableWatchlistIds.length === 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'Select at least one watchlist',
        path: ['watchlistIds'],
      })
    }
  })
}
