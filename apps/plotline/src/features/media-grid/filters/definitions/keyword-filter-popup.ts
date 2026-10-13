/**
 * Keeps the keyword typeahead open after a selection.
 *
 * The chips input sits outside the popup, so Base UI closes that popup and
 * clears the controlled query on item press. Canceling the close leaves the
 * current search in place so several keywords can be picked without retyping.
 *
 * @param open - Next popup open state from the combobox
 * @param eventDetails - Change details for that open change; canceled on item press
 */
export function keepKeywordPopupOpenOnItemPress(
  open: boolean,
  eventDetails: { cancel: () => void; reason: string },
): void {
  if (!open && eventDetails.reason === 'item-press') {
    eventDetails.cancel()
  }
}
