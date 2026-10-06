'use client'

import type { LibraryItem } from '@plotline/payload-types'

import { FieldGroup } from '@/components/ui/field'
import { ShowIf } from '@/components/utils/ShowIf'
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
        <AddToLibraryWatchlistField
          disabled={isSubmitting}
          disabledWatchlistIds={disabledWatchlistIds}
          form={form}
        />

        <ShowIf condition={!isInLibrary}>
          <AddToLibraryStatusField disabled={isSubmitting} form={form} />
        </ShowIf>

        <AddToLibraryNotesField disabled={isSubmitting} form={form} />
      </FieldGroup>

      <form.AppForm>
        <form.SubmitButton loadingLabel="Adding…">Add to Library</form.SubmitButton>
      </form.AppForm>
    </form>
  )
}
