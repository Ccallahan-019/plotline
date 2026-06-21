'use client'

import type { LibraryItem } from '@plotline/payload-types'

import { FieldGroup } from '@/components/ui/field'
import { ShowIf } from '@/components/utils/ShowIf'
import { getFieldErrorMessage } from '@/features/forms/services/get-field-error-message'
import { MediaDisplay } from '@/features/media-grid/types'

import { useAddToLibraryForm } from '../hooks/use-add-to-library-form'
import { AddToLibraryNotesField } from './AddToLibraryNotesField'
import { AddToLibraryStatusField } from './AddToLibraryStatusField'
import { AddToLibraryWatchlistField } from './AddToLibraryWatchlistField'

type AddToLibraryFormProps = {
  existingLibraryItem?: LibraryItem
  media: MediaDisplay
  onSuccess?: () => void
}

export function AddToLibraryForm({ existingLibraryItem, media, onSuccess }: AddToLibraryFormProps) {
  const { disabledWatchlistIds, form, isInLibrary, isSubmitting } = useAddToLibraryForm({
    existingLibraryItem,
    media,
    onSuccess,
  })

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    void form.handleSubmit()
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <FieldGroup>
        <form.AppField name="watchlistIds">
          {(field) => (
            <AddToLibraryWatchlistField
              disabled={isSubmitting}
              disabledWatchlistIds={disabledWatchlistIds}
              error={getFieldErrorMessage(field.state.meta.errors)}
              onChange={(watchlistIds) => {
                field.handleChange(
                  watchlistIds.filter((watchlistId) => !disabledWatchlistIds.has(watchlistId)),
                )
              }}
              selectedWatchlistIds={field.state.value}
            />
          )}
        </form.AppField>

        <ShowIf condition={!isInLibrary}>
          <form.AppField name="status">
            {(field) => (
              <AddToLibraryStatusField
                disabled={isSubmitting}
                error={getFieldErrorMessage(field.state.meta.errors)}
                onChange={field.handleChange}
                value={field.state.value}
              />
            )}
          </form.AppField>
        </ShowIf>

        <form.AppField name="note">
          {(field) => (
            <AddToLibraryNotesField
              disabled={isSubmitting}
              error={getFieldErrorMessage(field.state.meta.errors)}
              onChange={field.handleChange}
              value={field.state.value}
            />
          )}
        </form.AppField>
      </FieldGroup>

      <form.AppForm>
        <form.SubmitButton loadingLabel="Adding…">Add to Library</form.SubmitButton>
      </form.AppForm>
    </form>
  )
}
