import type { SearchMediaType, SearchSort } from '../types'

export function getDiscoverSortParams(
  sort: SearchSort,
  mediaType: SearchMediaType,
): Record<string, string> {
  const params: Record<string, string> = {
    sort_by: resolveSortBy(sort, mediaType),
  }

  if (sort === 'rating') {
    params['vote_count.gte'] = '50'
  }

  return params
}

export function resolveSortBy(sort: SearchSort, mediaType: SearchMediaType): string {
  switch (sort) {
    case 'newest':
      return mediaType === 'movie' ? 'release_date.desc' : 'first_air_date.desc'
    case 'oldest':
      return mediaType === 'movie' ? 'release_date.asc' : 'first_air_date.asc'
    case 'rating':
      return 'vote_average.desc'
    case 'popularity':
    default:
      return 'popularity.desc'
  }
}
