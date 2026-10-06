export type PersonalNotesDraftState = {
  draft: string
  previousSavedNotes: string
}

type SyncPersonalNotesDraftInput = {
  /** True while this control's save is pending, including its optimistic cache write. */
  isSaving: boolean
  /** Stored notes from props, with `null` normalized to an empty string. */
  savedNotes: string
} & PersonalNotesDraftState

// Blank drafts match stored empty notes, including whitespace-only values.
export function personalNotesMatch(draft: string, saved: null | string): boolean {
  return draft.trim() === (saved ?? '').trim()
}

/**
 * Adopts stored personal notes into the textarea when the draft is not an edit.
 *
 * A save publishes the submitted text into the cache before the request finishes.
 * Those in-flight values are ignored, so a failed save can roll the prop back
 * without treating the draft as already synced and clearing it. A draft that
 * still matches the last accepted notes, or that already matches the incoming
 * notes, is replaced. Any other edit stays put.
 *
 * @param input.draft - Current textarea value
 * @param input.isSaving - Whether this control's notes mutation is pending
 * @param input.previousSavedNotes - Last stored notes this control has accepted
 * @param input.savedNotes - Latest stored notes from props
 * @returns The next draft and the stored notes to accept
 */
export function syncPersonalNotesDraft(
  input: SyncPersonalNotesDraftInput,
): PersonalNotesDraftState {
  const { draft, isSaving, previousSavedNotes, savedNotes } = input

  if (isSaving || savedNotes === previousSavedNotes) {
    return { draft, previousSavedNotes }
  }

  return {
    draft:
      personalNotesMatch(draft, previousSavedNotes) || personalNotesMatch(draft, savedNotes)
        ? savedNotes
        : draft,
    previousSavedNotes: savedNotes,
  }
}
