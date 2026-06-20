import { normalizeMediaFilters } from '@/features/media-grid/filters/services/normalize-filters'

import type { LibraryItemsQuery } from '../types/library-items'

export const libraryGridQueryKeys = {
  libraryItems: (query: LibraryItemsQuery) =>
    [
      'library-items',
      'grid',
      normalizeMediaFilters(query.filters ?? {}),
      query.page ?? 1,
      query.pageSize ?? 24,
    ] as const,
  libraryItemsLookup: () => ['library-items', 'lookup'] as const,
} as const
