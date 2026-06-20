import type { FilterDefinition, FilterFieldRenderProps } from '../types'

import { SliderRangeFilterField } from '../components/SliderRangeFilterField'
import { getCurrentYear, getDefaultYearRange } from '../constants'

export const RELEASE_YEAR_FILTER_KEY = 'year'

function ReleaseYearFilterField({ draftFilters, setDraftFilters }: FilterFieldRenderProps) {
  const { max: defaultYearMax, min: defaultYearMin } = getDefaultYearRange()

  const yearRange: [number, number] = [
    draftFilters.yearMin ?? defaultYearMin,
    draftFilters.yearMax ?? defaultYearMax,
  ]

  const handleChange = (yearMin: number, yearMax: number) => {
    setDraftFilters({
      ...draftFilters,
      yearMax,
      yearMin,
    })
  }

  return (
    <SliderRangeFilterField
      label="Release Year"
      max={getCurrentYear()}
      min={defaultYearMin}
      onChange={handleChange}
      range={yearRange}
    />
  )
}

export const releaseYearFilterDefinition: FilterDefinition = {
  group: 'tmdb',
  key: RELEASE_YEAR_FILTER_KEY,
  label: 'Release Year',
  remove: (filters) => {
    const next = { ...filters }
    delete next.yearMin
    delete next.yearMax
    return next
  },
  render: (props) => <ReleaseYearFilterField {...props} />,
  toBadge: (filters) => {
    if (filters.yearMin === undefined && filters.yearMax === undefined) {
      return null
    }

    const { max: defaultYearMax, min: defaultYearMin } = getDefaultYearRange()
    const min = filters.yearMin ?? defaultYearMin
    const max = filters.yearMax ?? defaultYearMax

    return {
      key: RELEASE_YEAR_FILTER_KEY,
      label: `${min}–${max}`,
      prefix: 'Year',
    }
  },
}
