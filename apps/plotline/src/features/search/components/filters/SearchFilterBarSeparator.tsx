'use client'

import { Separator } from '@/components/ui/separator'

import { useBrowseMode } from '../../providers/BrowseModeProvider'

export function SearchFilterBarSeparator() {
  const { mode } = useBrowseMode()

  if (mode === 'search') return null

  return <Separator />
}
