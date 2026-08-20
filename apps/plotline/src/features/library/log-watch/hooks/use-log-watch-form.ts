'use client'

import type { LibraryItem, Media } from '@plotline/payload-types'

import { useMemo, useRef } from 'react'
import { toast } from 'sonner'

import { useAppForm } from '@/features/forms/hooks/use-app-form'
import { useLogWatch } from '@/features/library/library-grid/hooks/use-log-watch'
import { getMediaId } from '@/features/media-grid/grid/services/media-display-helpers'

import {
  getDefaultLogWatchFormValues,
  toLibraryItemAfterLogWatch,
  toLogWatchInput,
} from '../services/log-watch-form'
import { createLogWatchFormSchema } from '../services/log-watch-form-schema'

export type LogWatchFormApi = ReturnType<typeof useLogWatchForm>['form']

type UseLogWatchFormOptions = {
  libraryItem: LibraryItem
  media: Media
  onSuccess?: () => void
}

/**
 * Shared log-watch form for the popover and dialog so field values survive escalation.
 *
 * Defaults the next TV episode from library progress, validates on submit, and posts a
 * single watch event. Success toasts, resets the form to the following episode (and updated
 * status) so a later log in the same mounted session does not reuse stale defaults, then
 * calls `onSuccess`. Submit failures are shown in the toast and are not rethrown.
 *
 * @param options.libraryItem - Library row used for progress defaults and status transitions
 * @param options.media - Title being logged; supplies media type, id, and optional runtime
 * @param options.onSuccess - Called after a successful submit (typically to close the UI)
 * @returns `form` (TanStack form API) and `isSubmitting` (mutation or form pending)
 */
export function useLogWatchForm({ libraryItem, media, onSuccess }: UseLogWatchFormOptions) {
  const logWatchMutation = useLogWatch()
  const mediaType = media.mediaType
  const validationSchema = useMemo(() => createLogWatchFormSchema(mediaType), [mediaType])
  const currentLibraryItemRef = useRef(libraryItem)

  if (currentLibraryItemRef.current.id !== libraryItem.id) {
    currentLibraryItemRef.current = libraryItem
  }

  const form = useAppForm({
    defaultValues: getDefaultLogWatchFormValues({ libraryItem, mediaType }),
    onSubmit: async ({ formApi, value }) => {
      try {
        const result = await toast
          .promise(
            logWatchMutation.mutateAsync(
              toLogWatchInput({
                currentStatus: currentLibraryItemRef.current.status,
                mediaId: getMediaId(media),
                mediaType,
                runtimeMinutes: media.runtime ?? undefined,
                values: value,
              }),
            ),
            {
              error: {
                description: 'There was an error logging this watch. Please try again.',
                message: 'Error Logging Watch',
              },
              loading: 'Logging your watch...',
              success: {
                description: `${media.title} has been logged successfully.`,
                message: 'Watch Logged',
              },
            },
          )
          .unwrap()

        const nextLibraryItem = toLibraryItemAfterLogWatch({
          currentLibraryItem: currentLibraryItemRef.current,
          mediaType,
          resultLibraryItem: result.libraryItem,
          values: value,
        })

        currentLibraryItemRef.current = nextLibraryItem
        formApi.reset(getDefaultLogWatchFormValues({ libraryItem: nextLibraryItem, mediaType }))
        onSuccess?.()
      } catch {
        // No-op - toast promise will handle the error
      }
    },
    validators: {
      onSubmit: validationSchema,
    },
  })

  const isSubmitting = logWatchMutation.isPending || form.state.isSubmitting

  return {
    form,
    isSubmitting,
  }
}
