import { useState } from 'react'

import type { FilterCheckboxItem } from '../types'

import { getHiddenCheckboxItems, getVisibleCheckboxItems } from '../services/checkbox-list'

type UseExpandedCheckboxListProps<T extends FilterCheckboxItem> = {
  items: T[]
  selectedIds: Array<number | string>
}

export function useExpandedCheckboxList<T extends FilterCheckboxItem>({
  items,
  selectedIds,
}: UseExpandedCheckboxListProps<T>) {
  const [expanded, setExpanded] = useState(false)

  const visibleItems = getVisibleCheckboxItems(items, selectedIds)
  const hiddenItems = getHiddenCheckboxItems(visibleItems, items)
  const hasHiddenItems = hiddenItems.length > 0
  const triggerText = expanded ? 'Show less' : `Show all ${items.length} options`

  return {
    expanded,
    hasHiddenItems,
    hiddenItems,
    setExpanded,
    triggerText,
    visibleItems,
  }
}
