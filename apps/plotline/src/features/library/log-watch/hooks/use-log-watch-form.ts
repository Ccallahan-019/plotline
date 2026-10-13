'use client'

import type { LibraryItem, Media } from '@plotline/payload-types'

import { useMemo, useRef } from 'react'
import { toast } from 'sonner'

import { useAppForm } from '@/features/forms/hooks/use-app-form'
import { getMediaId } from '@/features/media-grid/grid/services/media-display-helpers'

import {
  getDefaultLogWatchFormValues,
  shouldSubmitLogWatchBatch,
  toLibraryItemAfterLogWatch,
  toLogWatchBatchInput,
  toLogWatchInput,
} from '../services/log-watch-form'
import { createLogWatchFormSchema } from '../services/log-watch-form-schema'
import { useLogWatch } from './use-log-watch'
import { useLogWatchBatch } from './use-log-watch-batch'

export type LogWatchFormApi = ReturnType<typeof useLogWatchForm>['form']

type UseLogWatchFormOptions = {
  libraryItem: LibraryItem
  media: Media
  onSuccess?: (libraryItem: LibraryItem) => void
}

/**
 * Shared log-watch form for the popover and dialog so field values survive escalation.
 *
 * Defaults the next TV episode from library progress, validates on submit, and posts a
 * single watch event or a multi-episode batch when more than one episode is selected.
 * Success toasts, resets the form to the following episode (and updated status) so a later
 * log in the same mounted session does not reuse stale defaults, then calls `onSuccess`
 * with that row. Submit failures are shown in the toast and are not rethrown.
 *
 * @param options.libraryItem - Library row used for progress defaults and status transitions
 * @param options.media - Title being logged; supplies media type and id
 * @param options.onSuccess - Called with the post-log library row (real id and progress) so the caller can close the UI and patch its cache
 * @returns `form` (TanStack form API) and `isSubmitting` (mutation or form pending)
 */
export function useLogWatchForm({ libraryItem, media, onSuccess }: UseLogWatchFormOptions) {
  const logWatchMutation = useLogWatch()
  const logWatchBatchMutation = useLogWatchBatch()
  const mediaType = media.mediaType
  const validationSchema = useMemo(() => createLogWatchFormSchema(mediaType), [mediaType])
  const currentLibraryItemRef = useRef(libraryItem)
  const onSuccessRef = useRef(onSuccess)

  if (currentLibraryItemRef.current.id !== libraryItem.id) {
    currentLibraryItemRef.current = libraryItem
  }

  // The form can keep the first submit closure. Always invoke the latest callback
  // so a title-page log patches the cache for the title that is on screen.
  onSuccessRef.current = onSuccess

  const form = useAppForm({
    defaultValues: getDefaultLogWatchFormValues({ libraryItem, mediaType }),
    onSubmit: async ({ formApi, value }) => {
      try {
        const mediaId = getMediaId(media)
        const currentStatus = currentLibraryItemRef.current.status
        const isBatch = shouldSubmitLogWatchBatch(value)
        const submitWatch: Promise<{ libraryItem: LibraryItem }> = isBatch
          ? logWatchBatchMutation.mutateAsync(
              toLogWatchBatchInput({
                currentStatus,
                mediaId,
                values: value,
              }),
            )
          : logWatchMutation.mutateAsync(
              toLogWatchInput({
                currentStatus,
                mediaId,
                mediaType,
                values: value,
              }),
            )

        const result = await toast
          .promise(submitWatch, {
            error: {
              description: 'There was an error logging this watch. Please try again.',
              message: 'Error Logging Watch',
            },
            loading: isBatch ? 'Logging your watches...' : 'Logging your watch...',
            success: {
              description: isBatch
                ? `${value.episodes.length} episodes of ${media.title} have been logged.`
                : `${media.title} has been logged successfully.`,
              message: 'Watch Logged',
            },
          })
          .unwrap()

        const nextLibraryItem = toLibraryItemAfterLogWatch({
          currentLibraryItem: currentLibraryItemRef.current,
          mediaType,
          resultLibraryItem: result.libraryItem,
          values: value,
        })

        currentLibraryItemRef.current = nextLibraryItem
        formApi.reset(getDefaultLogWatchFormValues({ libraryItem: nextLibraryItem, mediaType }))
        onSuccessRef.current?.(nextLibraryItem)
      } catch {
        // No-op - toast promise will handle the error
      }
    },
    validators: {
      onSubmit: validationSchema,
    },
  })

  const isSubmitting =
    logWatchMutation.isPending || logWatchBatchMutation.isPending || form.state.isSubmitting

  return {
    form,
    isSubmitting,
  }
}
