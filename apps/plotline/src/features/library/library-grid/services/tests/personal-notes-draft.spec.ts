import { describe, expect, it } from 'vitest'

import {
  type PersonalNotesDraftState,
  syncPersonalNotesDraft,
} from '../../services/personal-notes-draft'

describe('syncPersonalNotesDraft', () => {
  it('keeps the draft when a failed save rolls the optimistic notes back', () => {
    const editing = { draft: 'keep this ending', previousSavedNotes: '' }

    const duringSave = syncPersonalNotesDraft({
      ...editing,
      isSaving: true,
      savedNotes: 'keep this ending',
    })

    expect(duringSave).toEqual(editing)

    const afterRollback = syncPersonalNotesDraft({
      ...duringSave,
      isSaving: false,
      savedNotes: '',
    })

    expect(afterRollback).toEqual(editing)
  })

  it('keeps keystrokes typed while a save is in flight when that save fails', () => {
    let state: PersonalNotesDraftState = {
      draft: 'keep this ending',
      previousSavedNotes: 'old',
    }

    state = syncPersonalNotesDraft({
      ...state,
      draft: 'keep this ending, plus more',
      isSaving: true,
      savedNotes: 'keep this ending',
    })

    state = syncPersonalNotesDraft({
      ...state,
      isSaving: false,
      savedNotes: 'old',
    })

    expect(state).toEqual({
      draft: 'keep this ending, plus more',
      previousSavedNotes: 'old',
    })
  })

  it('adopts normalized stored notes after a save succeeds', () => {
    const duringSave = syncPersonalNotesDraft({
      draft: '  later  ',
      isSaving: true,
      previousSavedNotes: '',
      savedNotes: 'later',
    })

    expect(duringSave).toEqual({ draft: '  later  ', previousSavedNotes: '' })

    expect(
      syncPersonalNotesDraft({
        ...duringSave,
        isSaving: false,
        savedNotes: 'later',
      }),
    ).toEqual({ draft: 'later', previousSavedNotes: 'later' })
  })

  it('keeps text typed during a save that then succeeds', () => {
    const duringSave = syncPersonalNotesDraft({
      draft: 'later, and then',
      isSaving: true,
      previousSavedNotes: '',
      savedNotes: 'later',
    })

    expect(
      syncPersonalNotesDraft({
        ...duringSave,
        isSaving: false,
        savedNotes: 'later',
      }),
    ).toEqual({ draft: 'later, and then', previousSavedNotes: 'later' })
  })

  it('follows stored notes when the draft is not an edit', () => {
    expect(
      syncPersonalNotesDraft({
        draft: 'old',
        isSaving: false,
        previousSavedNotes: 'old',
        savedNotes: 'from the server',
      }),
    ).toEqual({ draft: 'from the server', previousSavedNotes: 'from the server' })
  })

  it('leaves an unsaved edit in place when stored notes change', () => {
    expect(
      syncPersonalNotesDraft({
        draft: 'still typing',
        isSaving: false,
        previousSavedNotes: 'old',
        savedNotes: 'from the server',
      }),
    ).toEqual({ draft: 'still typing', previousSavedNotes: 'from the server' })
  })
})
