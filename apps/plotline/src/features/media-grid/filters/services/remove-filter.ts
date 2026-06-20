import type { FilterDefinition, MediaFilters } from '../types'

import { normalizeMediaFilters } from './normalize-filters'

export function removeFilterByKey(
  filters: MediaFilters,
  key: string,
  definitions: FilterDefinition[],
): MediaFilters {
  const definition = definitions.find((item) => item.key === key)

  if (!definition) {
    return normalizeMediaFilters(filters)
  }

  return normalizeMediaFilters(definition.remove(filters))
}
