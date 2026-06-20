'use client'

import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'

import type { FilterBadge } from '../types'

import { useFilters } from '../providers/FiltersProvider'

type FilterBadgeButtonProps = {
  badge: FilterBadge
}

export function FilterBadgeButton({ badge }: FilterBadgeButtonProps) {
  const { removeFilter } = useFilters()

  const handleClear = () => {
    removeFilter(badge.key)
  }

  return (
    <Button className="rounded-full text-xs" onClick={handleClear} variant="secondary">
      <span className="text-muted-foreground">{badge.prefix}:</span> {badge.label}
      <X className="size-3 text-muted-foreground" data-icon="inline-end" />
    </Button>
  )
}
