'use client'

import { Film, Tv } from 'lucide-react'

import { ToggleGroupItem } from '@/components/ui/toggle-group'
import { ToggleGroup } from '@/components/ui/toggle-group'
import { GENRE_FILTER_KEY } from '@/features/media-grid/filters/definitions/genre-filter'
import { PROVIDER_FILTER_KEY } from '@/features/media-grid/filters/definitions/provider-filter'
import { useFilters } from '@/features/media-grid/filters/providers/FiltersProvider'

import type { SearchMediaType } from '../../types'

import { useMediaType } from '../../providers/MediaTypeProvider'
import { useTmdbBrowse } from '../../providers/TmdbBrowseProvider'

export function MediaTypeToggle() {
  const { mediaType, setMediaType } = useMediaType()
  const { removeFilter } = useFilters()
  const { setPage } = useTmdbBrowse()

  const handleChange = (value: string[]) => {
    if (!value.length) {
      return
    }

    setMediaType(value[0] as SearchMediaType)
    removeFilter(GENRE_FILTER_KEY)
    removeFilter(PROVIDER_FILTER_KEY)
    setPage(1)
  }

  return (
    <ToggleGroup onValueChange={handleChange} value={[mediaType]} variant="outline">
      <ToggleGroupItem className="flex items-center gap-2" value="movie">
        <Film />
        Film
      </ToggleGroupItem>
      <ToggleGroupItem className="flex items-center gap-2" value="tv">
        <Tv />
        TV
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
