import { LibraryItem } from '@plotline/payload-types'
import { useRef, useState } from 'react'

import { useUpdateLibraryItem } from '../../library-item/hooks/use-update-library-item'
import { personalNotesMatch, syncPersonalNotesDraft } from '../services/personal-notes-draft'

type UseLibraryItemPersonalNotesProps = {
  libraryItem: LibraryItem
  personalNotes: null | string
}

export function useLibraryItemPersonalNotes({
  libraryItem,
  personalNotes,
}: UseLibraryItemPersonalNotesProps) {
  const updateLibraryItem = useUpdateLibraryItem()
  const isSavingRef = useRef(false)
  const savedNotes = personalNotes ?? ''
  const [draft, setDraft] = useState(savedNotes)
  const [previousSavedNotes, setPreviousSavedNotes] = useState(savedNotes)
  const isSaving = updateLibraryItem.isPending
  const notesChanged = !personalNotesMatch(draft, personalNotes)
  // Ignore the optimistic cache write while saving so a failed request cannot
  // treat that in-flight value as the last saved notes and clear the draft.
  const syncedNotes = syncPersonalNotesDraft({
    draft,
    isSaving,
    previousSavedNotes,
    savedNotes,
  })

  if (syncedNotes.draft !== draft) {
    setDraft(syncedNotes.draft)
  }

  if (syncedNotes.previousSavedNotes !== previousSavedNotes) {
    setPreviousSavedNotes(syncedNotes.previousSavedNotes)
  }

  const handleSave = () => {
    if (!notesChanged || isSavingRef.current) {
      return
    }

    isSavingRef.current = true

    void updateLibraryItem
      .mutateAsync({
        libraryItem,
        libraryItemId: libraryItem.id,
        personalNotes: draft,
      })
      .catch(() => {
        // The mutation toasts the error and rolls the cache back.
      })
      .finally(() => {
        isSavingRef.current = false
      })
  }

  return {
    handleSave,
    isSaving,
    notesChanged,
    setDraft,
    syncedNotes,
  }
}
