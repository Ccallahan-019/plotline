'use client'

import { Compass, Search } from 'lucide-react'

import { ToggleGroupItem } from '@/components/ui/toggle-group'
import { ToggleGroup } from '@/components/ui/toggle-group'

import type { BrowseMode } from '../../types'

import { useBrowseMode } from '../../providers/BrowseModeProvider'
import { useTmdbBrowse } from '../../providers/TmdbBrowseProvider'

export function BrowseModeToggle() {
  const { mode, setMode } = useBrowseMode()
  const { setPage } = useTmdbBrowse()

  const handleChange = (value: string[]) => {
    if (!value.length) {
      return
    }

    setMode(value[0] as BrowseMode)
    setPage(1)
  }

  return (
    <ToggleGroup onValueChange={handleChange} value={[mode]} variant="outline">
      <ToggleGroupItem className="flex items-center gap-2" value="discover">
        <Compass />
        Discover
      </ToggleGroupItem>
      <ToggleGroupItem className="flex items-center gap-2" value="search">
        <Search />
        Search
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
