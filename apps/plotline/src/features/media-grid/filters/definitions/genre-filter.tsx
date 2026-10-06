import type { FilterDefinition, FilterFieldRenderProps, FilterRenderContext } from '../types'

import { CollapsibleCheckboxGroup } from '../components/CollapsibleCheckboxGroup'

export const GENRE_FILTER_KEY = 'genres'

function GenreFilterField({ context, draftFilters, setDraftFilters }: FilterFieldRenderProps) {
  const genres = context.genres ?? []
  const selectedGenreIds = draftFilters.genreIds ?? []

  if (genres.length === 0) {
    return null
  }

  const handleChange = (selectedIds: (number | string)[]) => {
    setDraftFilters({
      ...draftFilters,
      genreIds: selectedIds.length > 0 ? selectedIds.map((id) => Number(id)) : undefined,
    })
  }

  return (
    <CollapsibleCheckboxGroup
      fieldIdPrefix="genre"
      items={genres}
      label="Genre"
      onChange={handleChange}
      selectedIds={selectedGenreIds}
      showAllLabel={`Show all ${genres.length} genres`}
    />
  )
}

function getGenreBadgeLabel(genreIds: number[], context: FilterRenderContext): string {
  const labelById = context.genreNameById

  return genreIds.map((genreId) => labelById?.get(genreId) ?? `Genre ${genreId}`).join(', ')
}

export const genreFilterDefinition: FilterDefinition = {
  group: 'tmdb',
  isEnabled: (context) => (context.genres?.length ?? 0) > 0,
  key: GENRE_FILTER_KEY,
  label: 'Genre',
  remove: (filters) => {
    const next = { ...filters }
    delete next.genreIds
    return next
  },
  render: (props) => <GenreFilterField {...props} />,
  toBadge: (filters, context) => {
    if (!filters.genreIds?.length) {
      return null
    }

    return {
      key: GENRE_FILTER_KEY,
      label: getGenreBadgeLabel(filters.genreIds, context),
      prefix: 'Genres',
    }
  },
}
