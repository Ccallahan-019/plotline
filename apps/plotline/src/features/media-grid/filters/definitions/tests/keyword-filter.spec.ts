import { describe, expect, it, vi } from 'vitest'

import { keepKeywordPopupOpenOnItemPress } from '../keyword-filter-popup'

describe('keepKeywordPopupOpenOnItemPress', () => {
  it('cancels the close that follows selecting a keyword', () => {
    const cancel = vi.fn()

    keepKeywordPopupOpenOnItemPress(false, { cancel, reason: 'item-press' })

    expect(cancel).toHaveBeenCalledOnce()
  })

  it('lets escape, outside press, and chip removal close the popup', () => {
    for (const reason of ['escape-key', 'outside-press', 'chip-remove-press', 'focus-out']) {
      const cancel = vi.fn()

      keepKeywordPopupOpenOnItemPress(false, { cancel, reason })

      expect(cancel).not.toHaveBeenCalled()
    }
  })

  it('does not cancel when the popup is opening', () => {
    const cancel = vi.fn()

    keepKeywordPopupOpenOnItemPress(true, { cancel, reason: 'item-press' })

    expect(cancel).not.toHaveBeenCalled()
  })
})
