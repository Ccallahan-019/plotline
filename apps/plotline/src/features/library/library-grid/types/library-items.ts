import type { LibraryItem } from '@plotline/payload-types'

import type { MediaFilters } from '@/features/media-grid/filters/types'

export type LibraryItemsQuery = {
  filters?: MediaFilters
  page?: number
  pageSize?: number
}

export type LibraryItemsResponse = {
  docs: LibraryItem[]
  limit: number
  page: number
  totalDocs: number
  totalPages: number
}

export const DEFAULT_LIBRARY_PAGE_SIZE = 24
