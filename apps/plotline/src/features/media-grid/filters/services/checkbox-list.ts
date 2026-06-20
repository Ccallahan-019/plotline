import type { FilterCheckboxItem } from '../types'

import { INITIAL_VISIBLE_CHECKBOX_COUNT } from '../constants'

export function getHiddenCheckboxItems<T extends FilterCheckboxItem>(
  visibleItems: T[],
  allItems: T[],
): T[] {
  const visibleIds = new Set(visibleItems.map((item) => item.id))

  return allItems.filter((item) => !visibleIds.has(item.id))
}

export function getVisibleCheckboxItems<T extends FilterCheckboxItem>(
  items: T[],
  selectedIds: Array<number | string>,
): T[] {
  const selectedIdSet = new Set(selectedIds)

  if (selectedIds.length > INITIAL_VISIBLE_CHECKBOX_COUNT) {
    return items.filter((item) => selectedIdSet.has(item.id))
  }

  return sortCheckboxItemsWithSelectedFirst(items, selectedIds).slice(
    0,
    INITIAL_VISIBLE_CHECKBOX_COUNT,
  )
}

export function sortCheckboxItemsWithSelectedFirst<T extends FilterCheckboxItem>(
  items: T[],
  selectedIds: Array<number | string>,
): T[] {
  const selectedIdSet = new Set(selectedIds)
  const selected: T[] = []
  const unselected: T[] = []

  for (const item of items) {
    if (selectedIdSet.has(item.id)) {
      selected.push(item)
    } else {
      unselected.push(item)
    }
  }

  return [...selected, ...unselected]
}

export function toggleIdInArray<T extends number | string>(
  current: T[] | undefined,
  id: T,
  checked: boolean,
): T[] {
  const values = current ?? []

  if (checked) {
    return values.includes(id) ? values : [...values, id]
  }

  return values.filter((value) => value !== id)
}
