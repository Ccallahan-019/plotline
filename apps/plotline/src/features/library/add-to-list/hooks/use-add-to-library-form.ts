'use client'

import type { LibraryItem, WatchlistMembership } from '@plotline/payload-types'

import { useMemo } from 'react'
import { toast } from 'sonner'

import type { MediaDisplay } from '@/features/media-grid/types'

import { useAppForm } from '@/features/forms/hooks/use-app-form'
import { useAddToLists } from '@/features/library/add-to-list/hooks/use-add-to-lists'
import { useWatchlistMemberships } from '@/features/library/add-to-list/hooks/use-watchlist-memberships'
import {
  DEFAULT_ADD_TO_LIBRARY_FORM_VALUES,
  resolveAddToLibraryMedia,
} from '@/features/library/add-to-list/services/add-to-library-form'
import { createAddToLibraryFormSchema } from '@/features/library/add-to-list/services/add-to-library-form-schema'
import { getMembershipWatchlistIds } from '@/features/library/add-to-list/services/get-membership-watchlist-ids'
import { buildAddToListInputs } from '@/features/library/types/mutations'

const EMPTY_MEMBERSHIPS: WatchlistMembership[] = []

export type AddToLibraryFormApi = ReturnType<typeof useAddToLibraryForm>['form']

type UseAddToLibraryFormOptions = {
  existingLibraryItem?: LibraryItem
  media: MediaDisplay
  onSuccess?: () => void
}

/**
 * Add-to-library form for attaching a title to one or more watchlists.
 *
 * Disables watchlists the title is already on, validates on submit, and posts
 * memberships (plus an initial status when the title is not yet in the library).
 * Success toasts, resets the form, then calls `onSuccess`. Submit failures are
 * shown in the toast and are not rethrown.
 *
 * @param options.existingLibraryItem - Existing library row, when the title is already saved
 * @param options.media - Title being added; used to resolve the mutation payload
 * @param options.onSuccess - Called after a successful submit (typically to close the UI)
 * @returns `form`, `isSubmitting`, `isInLibrary`, and `disabledWatchlistIds` for field UI
 */
export function useAddToLibraryForm({
  existingLibraryItem,
  media,
  onSuccess,
}: UseAddToLibraryFormOptions) {
  const addToListsMutation = useAddToLists()
  const { data: membershipsData } = useWatchlistMemberships(existingLibraryItem?.id, {
    enabled: existingLibraryItem != null,
  })
  const memberships = membershipsData ?? EMPTY_MEMBERSHIPS

  const disabledWatchlistIds = useMemo(() => getMembershipWatchlistIds(memberships), [memberships])
  const validationSchema = useMemo(
    () => createAddToLibraryFormSchema(disabledWatchlistIds),
    [disabledWatchlistIds],
  )

  const isInLibrary = existingLibraryItem != null

  const form = useAppForm({
    defaultValues: DEFAULT_ADD_TO_LIBRARY_FORM_VALUES,
    onSubmit: async ({ formApi, value }) => {
      const selectableWatchlistIds = value.watchlistIds.filter(
        (watchlistId) => !disabledWatchlistIds.has(watchlistId),
      )

      try {
        await toast
          .promise(
            addToListsMutation.mutateAsync(
              buildAddToListInputs({
                media: resolveAddToLibraryMedia(media, existingLibraryItem),
                note: value.note.trim() || undefined,
                status: isInLibrary ? undefined : value.status,
                watchlistIds: selectableWatchlistIds,
              }),
            ),
            {
              error: {
                description:
                  'There was an error adding the media to your watchlists. Please try again.',
                message: 'Error Adding Media',
              },
              loading: 'Adding media to your watchlists...',
              success: (data) => {
                const responseMedia = data[0]?.libraryItem.media
                const title =
                  typeof responseMedia === 'object' ? responseMedia.title : `Media #${responseMedia}`
                const watchlistCount = selectableWatchlistIds.length
                const watchlistName = data[0]?.watchlist.name

                return {
                  description: `${title} has been added to ${watchlistCount === 1 ? watchlistName : 'your watchlists'} successfully.`,
                  message:
                    watchlistCount === 1
                      ? 'Added to Watchlist'
                      : `Added to ${watchlistCount} Watchlists`,
                }
              },
            },
          )
          .unwrap()

        formApi.reset()
        onSuccess?.()
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        // No-op - toast promise will handle the error
      }
    },
    validators: {
      onSubmit: validationSchema,
    },
  })

  const isSubmitting = addToListsMutation.isPending || form.state.isSubmitting

  return {
    disabledWatchlistIds,
    form,
    isInLibrary,
    isSubmitting,
  }
}
