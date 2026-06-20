import type { FilterDefinition, FilterFieldRenderProps, FilterValidationErrors } from '../types'

import { MinMaxNumberFilterField } from '../components/MinMaxNumberFilterField'
import { RATING_MAX, RATING_MIN } from '../constants'

export const RATING_FILTER_KEY = 'rating'

function RatingFilterField({ draftFilters, errors, setDraftFilters }: FilterFieldRenderProps) {
  const handleMaxChange = (ratingMax: number | undefined) => {
    setDraftFilters({
      ...draftFilters,
      ratingMax,
    })
  }
  const handleMinChange = (ratingMin: number | undefined) => {
    setDraftFilters({
      ...draftFilters,
      ratingMin,
    })
  }

  return (
    <MinMaxNumberFilterField
      error={errors[RATING_FILTER_KEY]}
      label="Rating"
      max={RATING_MAX}
      maxValue={draftFilters.ratingMax}
      min={RATING_MIN}
      minValue={draftFilters.ratingMin}
      onMaxChange={handleMaxChange}
      onMinChange={handleMinChange}
      step={0.1}
    />
  )
}

export const ratingFilterDefinition: FilterDefinition = {
  group: 'tmdb',
  key: RATING_FILTER_KEY,
  label: 'Rating',
  remove: (filters) => {
    const next = { ...filters }
    delete next.ratingMin
    delete next.ratingMax
    return next
  },
  render: (props) => <RatingFilterField {...props} />,
  toBadge: (filters) => {
    if (filters.ratingMin === undefined && filters.ratingMax === undefined) {
      return null
    }

    const min = filters.ratingMin ?? RATING_MIN
    const max = filters.ratingMax ?? RATING_MAX

    return {
      key: RATING_FILTER_KEY,
      label: `${min}–${max}`,
      prefix: 'Rating',
    }
  },
  validate: (filters): FilterValidationErrors => {
    const ratingMin = filters.ratingMin
    const ratingMax = filters.ratingMax
    const errors: FilterValidationErrors = {}

    if (ratingMin !== undefined && ratingMax !== undefined && ratingMin > ratingMax) {
      errors[RATING_FILTER_KEY] = 'Minimum rating must be less than or equal to maximum.'
    }

    return errors
  },
}
