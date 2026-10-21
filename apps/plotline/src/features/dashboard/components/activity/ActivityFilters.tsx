'use client'

import type { DashboardActivityKind, DashboardActivityMediaType } from '@/features/dashboard/types'

import { activityRangeOptions } from '@/features/dashboard/services/activity-display'

import { ActivityFilterSelector } from './ActivityFilterSelector'
import { ActivityToggleGroup } from './ActivityToggleGroup'

const ACTIVITY_KIND_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Watched', value: 'watched' },
  { label: 'Rated', value: 'rated' },
  { label: 'Reviewed', value: 'reviewed' },
  { label: 'Challenge', value: 'challenge' },
  { label: 'Milestone', value: 'milestone' },
] as const satisfies readonly { label: string; value: DashboardActivityKind }[]

const ACTIVITY_MEDIA_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Film', value: 'movie' },
  { label: 'TV', value: 'tv' },
] as const satisfies readonly { label: string; value: DashboardActivityMediaType }[]

type ActivityFiltersProps = {
  kind: DashboardActivityKind
  mediaType: DashboardActivityMediaType
  onKindChange: (kind: DashboardActivityKind) => void
  onMediaTypeChange: (mediaType: DashboardActivityMediaType) => void
  onRangeChange: (range: string) => void
  range: string
}

export function ActivityFilters({
  kind,
  mediaType,
  onKindChange,
  onMediaTypeChange,
  onRangeChange,
  range,
}: ActivityFiltersProps) {
  const rangeOptions = activityRangeOptions(range)

  function handleRangeChange(value: null | string) {
    const next = rangeOptions.find((option) => option.value === value)

    if (next) {
      onRangeChange(next.value)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <ActivityToggleGroup
        ariaLabel="Activity type"
        onValueChange={onKindChange}
        options={ACTIVITY_KIND_OPTIONS}
        value={kind}
      />
      <div className="ml-auto flex flex-wrap items-center gap-2">
        <ActivityToggleGroup
          ariaLabel="Media type"
          onValueChange={onMediaTypeChange}
          options={ACTIVITY_MEDIA_OPTIONS}
          value={mediaType}
        />
        <ActivityFilterSelector
          ariaLabel="Time range"
          onValueChange={handleRangeChange}
          options={rangeOptions}
          value={range}
        />
      </div>
    </div>
  )
}
