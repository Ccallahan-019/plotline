export type TitleSearchDestination = 'library' | 'watchlist'

export type TitleSearchRowClassification = {
  disabled: boolean
  reason: null | string
  showStatus: boolean
  state: TitleSearchRowState
}

export type TitleSearchRowState = 'in-library' | 'new' | 'on-list'

type ClassifyTitleSearchRowInput = {
  destination: TitleSearchDestination
  inLibrary: boolean
  onList: boolean
}

/**
 * Classifies a TMDB hit for the title-search dialog.
 *
 * `on-list` wins when the title is both in the library and on the current list.
 * Library adds are blocked for anything except `new`, and the status control stays
 * available. Watchlist adds are blocked only for `on-list`; a title already in the
 * library can still be added, without a status.
 *
 * @param input.destination - Library or watchlist page the dialog is serving
 * @param input.inLibrary - True when the profile already has this title
 * @param input.onList - True when this title is already on the current watchlist
 * @returns Whether the row is selectable, why not, and whether status applies
 */
export function classifyTitleSearchRow(
  input: ClassifyTitleSearchRowInput,
): TitleSearchRowClassification {
  const state = resolveTitleSearchRowState(input)

  if (input.destination === 'library') {
    const disabled = state !== 'new'

    return {
      disabled,
      reason: disabled ? 'Already in your library' : null,
      showStatus: true,
      state,
    }
  }

  const disabled = state === 'on-list'

  return {
    disabled,
    reason: disabled ? 'Already on this list' : null,
    showStatus: state === 'new',
    state,
  }
}

/**
 * Whether the dialog should show the status control for the current selection.
 *
 * The library dialog always shows it. A watchlist shows it only while a new title
 * (not yet in the library) is selected.
 *
 * @param destination - Library or watchlist page the dialog is serving
 * @param selected - Classification of the selected row, or null when nothing is selected
 * @returns True when the status field should be visible
 */
export function shouldShowTitleSearchStatus(
  destination: TitleSearchDestination,
  selected: null | TitleSearchRowClassification,
): boolean {
  if (selected) {
    return selected.showStatus
  }

  return destination === 'library'
}

// `on-list` wins when a title is both saved and on the current list.
function resolveTitleSearchRowState(
  input: Pick<ClassifyTitleSearchRowInput, 'inLibrary' | 'onList'>,
): TitleSearchRowState {
  if (input.onList) {
    return 'on-list'
  }

  if (input.inLibrary) {
    return 'in-library'
  }

  return 'new'
}
