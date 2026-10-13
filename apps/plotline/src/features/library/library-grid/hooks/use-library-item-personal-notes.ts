import { LibraryItem } from '@plotline/payload-types'
import { useRef, useState } from 'react'

import { useUpdateLibraryItem } from '../../library-item/hooks/use-update-library-item'
import { personalNotesMatch, syncPersonalNotesDraft } from '../services/personal-notes-draft'

type UseLibraryItemPersonalNotesProps = {
  libraryItem: LibraryItem
  personalNotes: null | string
}

/**
 * Draft state and save handler for the drawer's personal notes textarea.
 *
 * Keeps a local `draft` so typing does not touch the cache. When the stored notes change
 * (a save, a refetch, or a rollback) the draft adopts them only if it was not an unsaved
 * edit, via `syncPersonalNotesDraft`. While a save is pending the optimistic cache value is
 * ignored, so a failed save cannot wipe the text the user typed. `handleSave` does nothing
 * when the draft matches the stored notes, and ignores a second click while a save runs.
 *
 * @param props.libraryItem - Row being edited, used as the cache fallback and for the toast title
 * @param props.personalNotes - Stored notes from the row, `null` when empty
 * @returns `syncedNotes.draft` for the textarea value and `setDraft` for edits, `notesChanged`
 * to enable Save, `isSaving` while the mutation is pending, and `handleSave` to submit the draft
 */
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
