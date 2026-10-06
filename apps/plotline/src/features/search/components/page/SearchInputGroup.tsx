'use client'

import { Search, X } from 'lucide-react'

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import { ShowIf } from '@/components/utils/ShowIf'
import { cn } from '@/lib/utils'

import { useBrowseMode } from '../../providers/BrowseModeProvider'
import { useTmdbBrowse } from '../../providers/TmdbBrowseProvider'

type SearchInputGroupProps = {
  placeholder?: string
}

export function SearchInputGroup({ placeholder = 'Search by title…' }: SearchInputGroupProps) {
  const { handleClearQuery, isInitialLoading, query, setQuery } = useTmdbBrowse()
  const { mode } = useBrowseMode()

  const isDiscoverMode = mode === 'discover'
  const isDisabled = isDiscoverMode || isInitialLoading
  const showClearCondition = !isDisabled && query.length > 0

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value)
  }

  return (
    <InputGroup className={cn('h-10', isDisabled && 'opacity-60')}>
      <InputGroupAddon align="inline-start">
        <Search />
      </InputGroupAddon>

      <InputGroupInput
        aria-label="Search by title"
        disabled={isDisabled}
        onChange={handleChange}
        placeholder={isDisabled ? 'Search is disabled in Discover mode' : placeholder}
        value={query}
      />

      <ShowIf condition={showClearCondition}>
        <InputGroupAddon align="inline-end">
          <InputGroupButton aria-label="Clear search" onClick={handleClearQuery} size="icon-sm">
            <X />
          </InputGroupButton>
        </InputGroupAddon>
      </ShowIf>
    </InputGroup>
  )
}
