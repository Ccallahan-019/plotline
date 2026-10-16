'use client'

import type { DashboardActivityKind, DashboardActivityMediaType } from '@/features/dashboard/types'

import { ActivityFilterSelector } from './ActivityFilterSelector'

const ACTIVITY_KIND_OPTIONS = [
  { label: 'All Activity', value: 'all' },
  { label: 'Watched', value: 'watched' },
  { label: 'Rated', value: 'rated' },
  { label: 'Reviewed', value: 'reviewed' },
  { label: 'Challenges', value: 'challenge' },
  { label: 'Milestones', value: 'milestone' },
] as const satisfies readonly { label: string; value: DashboardActivityKind }[]

const ACTIVITY_MEDIA_OPTIONS = [
  { label: 'All Types', value: 'all' },
  { label: 'Films', value: 'movie' },
  { label: 'TV', value: 'tv' },
] as const satisfies readonly { label: string; value: DashboardActivityMediaType }[]

const ACTIVITY_RANGE_OPTIONS = [
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'Last 90 Days', value: '90d' },
  { label: 'This Year', value: 'year' },
  { label: 'All Time', value: 'all' },
] as const

export type ActivityRangeValue = (typeof ACTIVITY_RANGE_OPTIONS)[number]['value']

type ActivityFiltersProps = {
  kind: DashboardActivityKind
  mediaType: DashboardActivityMediaType
  onKindChange: (kind: DashboardActivityKind) => void
  onMediaTypeChange: (mediaType: DashboardActivityMediaType) => void
  onRangeChange: (range: ActivityRangeValue) => void
  range: ActivityRangeValue
}

export function ActivityFilters({
  kind,
  mediaType,
  onKindChange,
  onMediaTypeChange,
  onRangeChange,
  range,
}: ActivityFiltersProps) {
  const handleKindChange = (value: null | string) => {
    const next = ACTIVITY_KIND_OPTIONS.find((option) => option.value === value)

    if (next) {
      onKindChange(next.value)
    }
  }

  const handleMediaTypeChange = (value: null | string) => {
    const next = ACTIVITY_MEDIA_OPTIONS.find((option) => option.value === value)

    if (next) {
      onMediaTypeChange(next.value)
    }
  }

  const handleRangeChange = (value: null | string) => {
    const next = ACTIVITY_RANGE_OPTIONS.find((option) => option.value === value)

    if (next) {
      onRangeChange(next.value)
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <ActivityFilterSelector
        ariaLabel="Activity type"
        onValueChange={handleKindChange}
        options={ACTIVITY_KIND_OPTIONS}
        value={kind}
      />
      <ActivityFilterSelector
        ariaLabel="Media type"
        onValueChange={handleMediaTypeChange}
        options={ACTIVITY_MEDIA_OPTIONS}
        value={mediaType}
      />
      <ActivityFilterSelector
        ariaLabel="Time range"
        onValueChange={handleRangeChange}
        options={ACTIVITY_RANGE_OPTIONS}
        value={range}
      />
    </div>
  )
}
