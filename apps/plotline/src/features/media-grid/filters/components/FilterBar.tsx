'use client'

import type { ReactNode } from 'react'

import { ShowIf } from '@/components/utils/ShowIf'

import { useFilterRegistry } from '../providers/FilterRegistryProvider'
import { useFilters } from '../providers/FiltersProvider'
import { getFilterBadges } from '../services/get-filter-badges'
import { ClearAllFiltersButton } from './ClearAllFiltersButton'
import { FilterBadgeButton } from './FilterBadgeButton'
import { FilterSheet } from './FilterSheet'
import { NoFiltersBadge } from './NoFiltersBadge'
import { ShowFiltersButton } from './ShowFiltersButton'

type FilterBarProps = {
  endActions?: ReactNode
  onApply?: () => void
  visible?: boolean
}

export function FilterBar({ endActions, onApply, visible = true }: FilterBarProps) {
  const { appliedFilters } = useFilters()
  const { context, visibleDefinitions } = useFilterRegistry()

  const badges = getFilterBadges(appliedFilters, visibleDefinitions, context)
  const hasFilters = badges.length > 0

  if (!visible) {
    return null
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <FilterSheet onApply={onApply} />
      <div className="flex flex-1 items-center flex-wrap gap-2">
        <ShowIf condition={!hasFilters}>
          <NoFiltersBadge />
        </ShowIf>

        {badges.map((badge) => (
          <FilterBadgeButton badge={badge} key={badge.key} />
        ))}

        <ClearAllFiltersButton
          badgeVariant="outline"
          className="rounded-full"
          showBadge={false}
          size="default"
        />
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        {endActions}
        <ShowFiltersButton />
      </div>
    </div>
  )
}
