'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ShowIf } from '@/components/utils/ShowIf'
import { cn } from '@/lib/utils'

import { useFilterErrors } from '../providers/FilterErrorsProvider'
import { useFilterRegistry } from '../providers/FilterRegistryProvider'
import { useFilters } from '../providers/FiltersProvider'
import { countActiveFilters } from '../services/get-filter-badges'

type ClearAllFiltersButtonProps = {
  badgeVariant?: 'ghost' | 'outline'
  className?: string
  showBadge?: boolean
  size?: 'default' | 'sm' | 'xs'
}

export function ClearAllFiltersButton({
  badgeVariant = 'ghost',
  className,
  showBadge = true,
  size = 'sm',
}: ClearAllFiltersButtonProps) {
  const { appliedFilters, clearAll } = useFilters()
  const { clearErrors } = useFilterErrors()
  const { context, visibleDefinitions } = useFilterRegistry()

  const filterCount = countActiveFilters(appliedFilters, visibleDefinitions, context)
  const hasFilters = filterCount > 0

  const handleClearAll = () => {
    clearAll()
    clearErrors()
  }

  if (!hasFilters) {
    return null
  }

  return (
    <Button
      className={cn('flex items-center gap-2', className)}
      onClick={handleClearAll}
      size={size}
      variant={badgeVariant}
    >
      Clear All
      <ShowIf condition={showBadge}>
        <Badge variant="outline">{filterCount}</Badge>
      </ShowIf>
    </Button>
  )
}
