'use client'

import { LayoutGrid, Logs } from 'lucide-react'

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

import type { MembershipLayout } from '../hooks/use-membership-layout'

type WatchlistMembershipViewToggleProps = {
  layout: MembershipLayout | null
  onLayoutChange: (layout: MembershipLayout) => void
}

export function WatchlistMembershipViewToggle({
  layout,
  onLayoutChange,
}: WatchlistMembershipViewToggleProps) {
  const handleChange = (value: string[]) => {
    const next = value[0]

    if (next === 'rows' || next === 'grid') {
      onLayoutChange(next)
    }
  }

  return (
    <ToggleGroup
      aria-label="Title layout"
      onValueChange={handleChange}
      size="sm"
      spacing={0}
      value={layout == null ? [] : [layout]}
      variant="outline"
    >
      <ToggleGroupItem className="flex items-center gap-2 px-2.5" value="rows">
        <Logs />
        Rows
      </ToggleGroupItem>
      <ToggleGroupItem className="flex items-center gap-2 px-2.5" value="grid">
        <LayoutGrid />
        Grid
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
