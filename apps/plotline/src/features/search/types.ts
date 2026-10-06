import type { MediaFilters } from '@/features/media-grid/filters/types'

export type BrowseMode = 'discover' | 'search'

export type SearchMediaType = 'movie' | 'tv'

export const DEFAULT_SEARCH_MEDIA_TYPE: SearchMediaType = 'movie'

export type SearchFilters = Pick<
  MediaFilters,
  | 'genreIds'
  | 'providerIds'
  | 'ratingMax'
  | 'ratingMin'
  | 'runtimeMax'
  | 'runtimeMin'
  | 'yearMax'
  | 'yearMin'
>

export const DEFAULT_SEARCH_FILTERS: SearchFilters = {}

export const SEARCH_SORT_OPTIONS = [
  { label: 'Popularity', value: 'popularity' },
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
  { label: 'Top Rated', value: 'rating' },
] as const

export type SearchSort = (typeof SEARCH_SORT_OPTIONS)[number]['value']

export const DEFAULT_SEARCH_SORT: SearchSort = 'popularity'

export type Genre = { id: number; name: string }

export type TmdbGenresResponse = {
  movie: { id: number; name: string }[]
  tv: { id: number; name: string }[]
}

export type TmdbWatchProvidersResponse = {
  providers: WatchProvider[]
  region: string
}

export type WatchProvider = {
  id: number
  logoPath?: null | string
  name: string
}

export function getSearchSortLabel(sort: SearchSort): string {
  return SEARCH_SORT_OPTIONS.find((option) => option.value === sort)?.label ?? 'Popularity'
}
