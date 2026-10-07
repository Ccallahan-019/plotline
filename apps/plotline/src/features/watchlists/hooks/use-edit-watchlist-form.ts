'use client'

import type { Watchlist } from '@plotline/payload-types'

import { toast } from 'sonner'

import { useAppForm } from '@/features/forms/hooks/use-app-form'

import {
  editWatchlistFormSchema,
  toEditWatchlistFormValues,
  toUpdateWatchlistInput,
} from '../services/edit-watchlist-form'
import { useUpdateWatchlist } from './use-update-watchlist'

export type EditWatchlistFormApi = ReturnType<typeof useEditWatchlistForm>['form']

type UseEditWatchlistFormOptions = {
  onSuccess?: () => void
  slug: string
  watchlist: Pick<Watchlist, 'description' | 'name' | 'visibility'>
}

/**
 * Edit form for a watchlist's name, description, and visibility.
 *
 * Validates on submit, then saves through `useUpdateWatchlist`. Success toasts
 * and calls `onSuccess` (typically to close the dialog). Submit failures are
 * shown in the toast and are not rethrown. Call `form.reset` with fresh values
 * when the dialog opens so a cancelled edit does not linger.
 *
 * @param options.onSuccess - Called after a successful save
 * @param options.slug - Watchlist slug for the update request
 * @param options.watchlist - Current details used as the form defaults
 * @returns `form` and `isSubmitting` for the dialog fields
 */
export function useEditWatchlistForm({ onSuccess, slug, watchlist }: UseEditWatchlistFormOptions) {
  const updateWatchlist = useUpdateWatchlist()

  const form = useAppForm({
    defaultValues: toEditWatchlistFormValues(watchlist),
    onSubmit: async ({ value }) => {
      const input = toUpdateWatchlistInput(value)

      try {
        await toast
          .promise(updateWatchlist.mutateAsync({ slug, ...input }), {
            error: {
              description: 'There was an error saving this watchlist. Please try again.',
              message: 'Could not update watchlist',
            },
            loading: 'Saving watchlist...',
            success: {
              description: `${input.name} was updated.`,
              message: 'Watchlist updated',
            },
          })
          .unwrap()

        onSuccess?.()
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        // No-op - toast promise will handle the error
      }
    },
    validators: {
      onSubmit: editWatchlistFormSchema,
    },
  })

  return {
    form,
    isSubmitting: updateWatchlist.isPending || form.state.isSubmitting,
  }
}
