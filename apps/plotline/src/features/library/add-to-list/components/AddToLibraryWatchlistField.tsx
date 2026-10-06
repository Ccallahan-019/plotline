'use client'

import { Field, FieldContent, FieldLabel } from '@/components/ui/field'
import { ShowIf } from '@/components/utils/ShowIf'

import type { AddToLibraryFormApi } from '../hooks/use-add-to-library-form'

import { EMPTY_DISABLED_WATCHLIST_IDS, useWatchlistField } from '../hooks/use-watchlist-field'

type AddToLibraryWatchlistFieldProps = {
  disabled?: boolean
  disabledWatchlistIds?: Set<number>
  form: AddToLibraryFormApi
}

export function AddToLibraryWatchlistField({
  disabled = false,
  disabledWatchlistIds = EMPTY_DISABLED_WATCHLIST_IDS,
  form,
}: AddToLibraryWatchlistFieldProps) {
  const { emptyContent, items } = useWatchlistField({
    disabledWatchlistIds,
  })

  return (
    <form.AppField name="watchlistIds">
      {(field) => (
        <Field data-disabled={disabled}>
          <FieldLabel htmlFor={field.name}>Watchlists</FieldLabel>
          <FieldContent className="gap-1">
            <field.ComboboxField
              disabled={disabled}
              emptyContent={emptyContent}
              items={items}
              placeholder="Select watchlists"
              renderItem={(item) => (
                <>
                  {item.label}
                  <ShowIf condition={!!item.disabled}>
                    <span className="text-muted-foreground"> (added)</span>
                  </ShowIf>
                </>
              )}
            />
          </FieldContent>
          <field.FormFieldError />
        </Field>
      )}
    </form.AppField>
  )
}
