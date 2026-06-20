'use client'

import type { LibraryItem, WatchlistMembership } from '@plotline/payload-types'
import type { MediaStatus } from '@plotline/shared/constants/media'

import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'

import type { MediaDisplay } from '@/features/media-grid/types'

import { useAddToLists } from '@/features/library/add-to-list/hooks/use-add-to-lists'
import { useWatchlistMemberships } from '@/features/library/add-to-list/hooks/use-watchlist-memberships'
import {
  type AddToLibraryFieldErrors,
  type AddToLibraryFormValues,
  DEFAULT_ADD_TO_LIBRARY_FORM_VALUES,
  hasAddToLibraryFieldErrors,
  resolveAddToLibraryMedia,
  validateAddToLibraryForm,
} from '@/features/library/add-to-list/services/add-to-library-form'
import { getMembershipWatchlistIds } from '@/features/library/add-to-list/services/get-membership-watchlist-ids'
import { buildAddToListInputs } from '@/features/library/types/mutations'

const EMPTY_MEMBERSHIPS: WatchlistMembership[] = []

type UseAddToLibraryFormOptions = {
  existingLibraryItem?: LibraryItem
  media: MediaDisplay
  onSuccess?: () => void
}

export function useAddToLibraryForm({
  existingLibraryItem,
  media,
  onSuccess,
}: UseAddToLibraryFormOptions) {
  const [values, setValues] = useState<AddToLibraryFormValues>(DEFAULT_ADD_TO_LIBRARY_FORM_VALUES)
  const [fieldErrors, setFieldErrors] = useState<AddToLibraryFieldErrors>({})

  const addToListsMutation = useAddToLists()
  const { data: membershipsData } = useWatchlistMemberships(existingLibraryItem?.id, {
    enabled: existingLibraryItem != null,
  })
  const memberships = membershipsData ?? EMPTY_MEMBERSHIPS

  const disabledWatchlistIds = useMemo(() => getMembershipWatchlistIds(memberships), [memberships])

  const isInLibrary = existingLibraryItem != null
  const isSubmitting = addToListsMutation.isPending

  const resetForm = useCallback(() => {
    setValues(DEFAULT_ADD_TO_LIBRARY_FORM_VALUES)
    setFieldErrors({})
  }, [])

  const setStatus = useCallback((status: MediaStatus) => {
    setValues((current) => ({ ...current, status }))
    setFieldErrors((current) => ({ ...current, status: undefined }))
  }, [])

  const setNote = useCallback((note: string) => {
    setValues((current) => ({ ...current, note }))
    setFieldErrors((current) => ({ ...current, note: undefined }))
  }, [])

  const setWatchlistIds = useCallback(
    (watchlistIds: number[]) => {
      const nextWatchlistIds = watchlistIds.filter(
        (watchlistId) => !disabledWatchlistIds.has(watchlistId),
      )

      setValues((current) => {
        if (areWatchlistIdsEqual(current.watchlistIds, nextWatchlistIds)) {
          return current
        }

        return { ...current, watchlistIds: nextWatchlistIds }
      })
      setFieldErrors((current) => ({ ...current, watchlists: undefined }))
    },
    [disabledWatchlistIds],
  )

  const submit = useCallback(async () => {
    const errors = validateAddToLibraryForm(values, { disabledWatchlistIds })

    if (hasAddToLibraryFieldErrors(errors)) {
      setFieldErrors(errors)
      return
    }

    const selectableWatchlistIds = values.watchlistIds.filter(
      (watchlistId) => !disabledWatchlistIds.has(watchlistId),
    )

    try {
      await toast
        .promise(
          addToListsMutation.mutateAsync(
            buildAddToListInputs({
              media: resolveAddToLibraryMedia(media, existingLibraryItem),
              note: values.note.trim() || undefined,
              status: isInLibrary ? undefined : values.status,
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
              const media = data[0]?.libraryItem.media
              const title = typeof media === 'object' ? media.title : `Media #${media}`
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

      resetForm()
      onSuccess?.()
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      // No-op - toast promise will handle the error
    }
  }, [
    addToListsMutation,
    disabledWatchlistIds,
    existingLibraryItem,
    isInLibrary,
    media,
    onSuccess,
    resetForm,
    values,
  ])

  return {
    disabledWatchlistIds,
    fieldErrors,
    isInLibrary,
    isSubmitting,
    resetForm,
    setNote,
    setStatus,
    setWatchlistIds,
    submit,
    values,
  }
}

function areWatchlistIdsEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) {
    return false
  }

  return a.every((id, index) => id === b[index])
}
