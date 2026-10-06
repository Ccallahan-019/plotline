import type { MediaFilters } from '@/features/media-grid/filters/types'

import { hasActiveFilters } from '@/features/media-grid/filters/services/normalize-filters'

export function getLibraryEmptyCopy(filters: MediaFilters = {}): {
  description: string
  title: string
} {
  if (hasActiveFilters(filters)) {
    return {
      description: 'Try adjusting your filters to see more results.',
      title: 'No Matching Titles',
    }
  }

  return {
    description: 'Search TMDB and add titles to start tracking.',
    title: 'Your Library is Empty',
  }
}
