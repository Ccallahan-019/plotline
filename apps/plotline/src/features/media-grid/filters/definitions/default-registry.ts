import type { FilterDefinition } from '../types'

import { genreFilterDefinition } from './genre-filter'
import { mediaTypeFilterDefinition } from './media-type-filter'
import { providerFilterDefinition } from './provider-filter'
import { ratingFilterDefinition } from './rating-filter'
import { releaseYearFilterDefinition } from './release-year-filter'
import { runtimeFilterDefinition } from './runtime-filter'
import { sourceFilterDefinition } from './source-filter'
import { statusFilterDefinition } from './status-filter'
import { watchlistFilterDefinition } from './watchlist-filter'

export const DEFAULT_FILTER_DEFINITIONS: FilterDefinition[] = [
  statusFilterDefinition,
  mediaTypeFilterDefinition,
  sourceFilterDefinition,
  watchlistFilterDefinition,
  genreFilterDefinition,
  releaseYearFilterDefinition,
  ratingFilterDefinition,
  providerFilterDefinition,
  runtimeFilterDefinition,
]

export const LIBRARY_FILTER_DEFINITIONS: FilterDefinition[] = [
  statusFilterDefinition,
  mediaTypeFilterDefinition,
  sourceFilterDefinition,
  watchlistFilterDefinition,
]

export const TMDB_FILTER_DEFINITIONS: FilterDefinition[] = [
  genreFilterDefinition,
  releaseYearFilterDefinition,
  ratingFilterDefinition,
  providerFilterDefinition,
  runtimeFilterDefinition,
]
