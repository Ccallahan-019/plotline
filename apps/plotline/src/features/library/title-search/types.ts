import { TmdbSearchResultItem } from '@plotline/shared/tmdb'

import { MediaDisplay } from '@/features/media-grid/types'

export type TitleSearchItem = {
  display: MediaDisplay
  id: string
  label: string
  result: TmdbSearchResultItem
}
