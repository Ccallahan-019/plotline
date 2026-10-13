'use client'

import type { LibraryItem } from '@plotline/payload-types'

import { PencilLine } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

import { useLibraryItemPersonalNotes } from '../../hooks/use-library-item-personal-notes'
import { LibraryItemDrawerSection } from './LibraryItemDrawerSection'

type LibraryItemPersonalNotesProps = {
  libraryItem: LibraryItem
  personalNotes: null | string
}

export function LibraryItemPersonalNotes({
  libraryItem,
  personalNotes,
}: LibraryItemPersonalNotesProps) {
  const { handleSave, isSaving, notesChanged, setDraft, syncedNotes } = useLibraryItemPersonalNotes(
    { libraryItem, personalNotes },
  )

  return (
    <LibraryItemDrawerSection title="Personal Notes">
      <div className="flex flex-col gap-2 items-end">
        <Textarea
          aria-label="Personal notes"
          onChange={(event) => {
            setDraft(event.target.value)
          }}
          placeholder="Your personal notes..."
          value={syncedNotes.draft}
        />
        <Button
          className="w-fit"
          disabled={!notesChanged || isSaving}
          onClick={handleSave}
          type="button"
          variant="secondary"
        >
          <PencilLine data-icon="inline-start" />
          Save Notes
        </Button>
      </div>
    </LibraryItemDrawerSection>
  )
}
