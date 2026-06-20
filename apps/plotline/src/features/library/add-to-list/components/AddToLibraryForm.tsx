'use client'

import type { LibraryItem } from '@plotline/payload-types'

import { Button } from '@/components/ui/button'
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
  const {
    disabledWatchlistIds,
    fieldErrors,
    isInLibrary,
    isSubmitting,
    setNote,
    setStatus,
    setWatchlistIds,
    submit,
    values,
  } = useAddToLibraryForm({
    existingLibraryItem,
    media,
    onSuccess,
  })

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    void submit()
  }

  const buttonContent = isSubmitting ? 'Adding…' : 'Add to Library'

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <FieldGroup>
        <AddToLibraryWatchlistField
          disabled={isSubmitting}
          disabledWatchlistIds={disabledWatchlistIds}
          error={fieldErrors.watchlists}
          onChange={setWatchlistIds}
          selectedWatchlistIds={values.watchlistIds}
        />

        <ShowIf condition={!isInLibrary}>
          <AddToLibraryStatusField
            disabled={isSubmitting}
            error={fieldErrors.status}
            onChange={setStatus}
            value={values.status}
          />
        </ShowIf>

        <AddToLibraryNotesField
          disabled={isSubmitting}
          error={fieldErrors.note}
          onChange={setNote}
          value={values.note}
        />
      </FieldGroup>

      <Button disabled={isSubmitting} type="submit">
        {buttonContent}
      </Button>
    </form>
  )
}
