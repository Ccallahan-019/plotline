'use client'

import { SlidersHorizontal } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ShowIf } from '@/components/utils/ShowIf'
import { useOpenState } from '@/providers/OpenStateProvider'

import { useFilterRegistry } from '../providers/FilterRegistryProvider'
import { useFilters } from '../providers/FiltersProvider'
import { countActiveFilters } from '../services/get-filter-badges'

export function ShowFiltersButton() {
  const { setIsOpen } = useOpenState()
  const { appliedFilters } = useFilters()
  const { context, visibleDefinitions } = useFilterRegistry()

  const filterCount = countActiveFilters(appliedFilters, visibleDefinitions, context)
  const hasFilters = filterCount > 0

  const handleClick = () => {
    setIsOpen(true)
  }

  return (
    <Button className="shrink-0 gap-2" onClick={handleClick} type="button" variant="outline">
      <SlidersHorizontal data-icon="inline-start" />
      Show Filters
      <ShowIf condition={hasFilters}>
        <Badge>{filterCount}</Badge>
      </ShowIf>
    </Button>
  )
}
