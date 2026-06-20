import { normalizeMediaFilters } from '@/features/media-grid/filters/services/normalize-filters'

import type { LibraryItemsQuery } from '../types'

import { DEFAULT_LIBRARY_SORT } from '../types'

export const libraryGridQueryKeys = {
  libraryItems: (query: LibraryItemsQuery) =>
    [
      'library-items',
      'grid',
      normalizeMediaFilters(query.filters ?? {}),
      query.page ?? 1,
      query.pageSize ?? 24,
      query.sort ?? DEFAULT_LIBRARY_SORT,
    ] as const,
  libraryItemsLookup: () => ['library-items', 'lookup'] as const,
} as const
