'use client'

import { Button } from '@/components/ui/button'

import { useApplyFilters } from '../hooks/use-apply-filters'

type ApplyFiltersButtonProps = {
  onApply?: () => void
}

export function ApplyFiltersButton({ onApply }: ApplyFiltersButtonProps) {
  const { handleApply } = useApplyFilters({ onApply })

  return (
    <Button onClick={handleApply} type="button">
      Apply Filters
    </Button>
  )
}
