import type { FilterDefinition, FilterFieldRenderProps, FilterValidationErrors } from '../types'

import { SliderRangeFilterField } from '../components/SliderRangeFilterField'
import {
  formatRuntimeLabel,
  getDefaultRuntimeRange,
  RUNTIME_RANGE_MAX,
  RUNTIME_RANGE_MIN,
} from '../constants'

export const RUNTIME_FILTER_KEY = 'runtime'

function RuntimeFilterField({ draftFilters, errors, setDraftFilters }: FilterFieldRenderProps) {
  const { max: defaultRuntimeMax, min: defaultRuntimeMin } = getDefaultRuntimeRange()

  const runtimeRange: [number, number] = [
    draftFilters.runtimeMin ?? defaultRuntimeMin,
    draftFilters.runtimeMax ?? defaultRuntimeMax,
  ]

  const handleChange = (runtimeMin: number, runtimeMax: number) => {
    setDraftFilters({
      ...draftFilters,
      runtimeMax,
      runtimeMin,
    })
  }

  return (
    <SliderRangeFilterField
      error={errors[RUNTIME_FILTER_KEY]}
      formatValue={formatRuntimeLabel}
      label="Runtime"
      max={RUNTIME_RANGE_MAX}
      min={RUNTIME_RANGE_MIN}
      onChange={handleChange}
      range={runtimeRange}
      step={5}
    />
  )
}

export const runtimeFilterDefinition: FilterDefinition = {
  group: 'tmdb',
  key: RUNTIME_FILTER_KEY,
  label: 'Runtime',
  remove: (filters) => {
    const next = { ...filters }
    delete next.runtimeMin
    delete next.runtimeMax
    return next
  },
  render: (props) => <RuntimeFilterField {...props} />,
  toBadge: (filters) => {
    if (filters.runtimeMin === undefined && filters.runtimeMax === undefined) {
      return null
    }

    const { max: defaultRuntimeMax, min: defaultRuntimeMin } = getDefaultRuntimeRange()
    const min = filters.runtimeMin ?? defaultRuntimeMin
    const max = filters.runtimeMax ?? defaultRuntimeMax

    return {
      key: RUNTIME_FILTER_KEY,
      label: `${formatRuntimeLabel(min)}–${formatRuntimeLabel(max)}`,
      prefix: 'Runtime',
    }
  },
  validate: (filters): FilterValidationErrors => {
    const runtimeMin = filters.runtimeMin
    const runtimeMax = filters.runtimeMax
    const errors: FilterValidationErrors = {}

    if (runtimeMin !== undefined && runtimeMax !== undefined && runtimeMin > runtimeMax) {
      errors[RUNTIME_FILTER_KEY] = 'Minimum runtime must be less than or equal to maximum.'
    }

    return errors
  },
}
