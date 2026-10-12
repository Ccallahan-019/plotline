'use client'

import type { Watchlist } from '@plotline/payload-types'

import { useRef } from 'react'
import { toast } from 'sonner'

import { useAppForm } from '@/features/forms/hooks/use-app-form'

import {
  createWatchlistFormValues,
  toWatchlistFormValues,
  toWatchlistWriteInput,
  watchlistFormSchema,
} from '../services/watchlist-form'
import { useCreateWatchlist } from './use-create-watchlist'
import { useUpdateWatchlist } from './use-update-watchlist'

export type WatchlistFormApi = ReturnType<typeof useWatchlistForm>['form']

type UseWatchlistFormOptions = (
  | {
      challengeEnabled: boolean
      mode: 'create'
    }
  | {
      mode: 'edit'
      watchlist: Watchlist
    }
) & {
  onSuccess?: (watchlist: Watchlist) => void
}

/**
 * Shared create and edit form for a watchlist, including challenge settings.
 *
 * Validates on submit, then creates or updates through the watchlist mutations.
 * Success toasts and calls `onSuccess` with the saved watchlist so the page can
 * open the list or challenge detail. Submit failures stay in the toast.
 * System lists save with challenge mode off.
 *
 * @param options.challengeEnabled - Create only. Starts the challenge switch on
 * @param options.mode - `create` posts a new list; `edit` patches the current one
 * @param options.onSuccess - Called with the saved watchlist
 * @param options.watchlist - Edit only. Current details used as the form defaults
 * @returns `form`, `isSubmitting`, and whether this list is a system list
 */
export function useWatchlistForm(options: UseWatchlistFormOptions) {
  const createWatchlist = useCreateWatchlist()
  const updateWatchlist = useUpdateWatchlist()
  const optionsRef = useRef(options)

  optionsRef.current = options

  const isSystem = options.mode === 'edit' && options.watchlist.isSystem === true
  const defaultValues =
    options.mode === 'create'
      ? createWatchlistFormValues(options.challengeEnabled)
      : toWatchlistFormValues(options.watchlist)

  const form = useAppForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      const current = optionsRef.current
      const systemList = current.mode === 'edit' && current.watchlist.isSystem === true
      const input = toWatchlistWriteInput(value, { isSystem: systemList })
      const isChallenge = input.challenge.enabled
      const subject = isChallenge ? 'challenge' : 'watchlist'

      try {
        const saved =
          current.mode === 'create'
            ? await toast
                .promise(createWatchlist.mutateAsync(input), {
                  error: {
                    description: `There was an error creating this ${subject}. Please try again.`,
                    message: `Could not create ${subject}`,
                  },
                  loading: `Creating ${subject}...`,
                  success: {
                    description: `${input.name} was created.`,
                    message: `Created ${subject}`,
                  },
                })
                .unwrap()
            : await toast
                .promise(updateWatchlist.mutateAsync({ slug: current.watchlist.slug, ...input }), {
                  error: {
                    description: `There was an error saving this ${subject}. Please try again.`,
                    message: `Could not update ${subject}`,
                  },
                  loading: `Saving ${subject}...`,
                  success: {
                    description: `${input.name} was updated.`,
                    message: `Updated ${subject}`,
                  },
                })
                .unwrap()

        optionsRef.current.onSuccess?.(saved)
      } catch {
        // No-op - toast promise will handle the error
      }
    },
    validators: {
      onSubmit: watchlistFormSchema,
    },
  })

  return {
    form,
    isSubmitting: createWatchlist.isPending || updateWatchlist.isPending || form.state.isSubmitting,
    isSystem,
  }
}
