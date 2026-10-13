'use client'

import { Search, X } from 'lucide-react'

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Spinner } from '@/components/ui/spinner'
import { ShowIf } from '@/components/utils/ShowIf'

type TitleSearchQueryFieldProps = {
  disabled?: boolean
  isBusy: boolean
  onQueryChange: (query: string) => void
  query: string
}

export function TitleSearchQueryField({
  disabled = false,
  isBusy,
  onQueryChange,
  query,
}: TitleSearchQueryFieldProps) {
  const showClear = !disabled && query.length > 0

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onQueryChange(event.target.value)
  }

  const handleClear = () => {
    onQueryChange('')
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
    }
  }

  return (
    <InputGroup>
      <InputGroupAddon align="inline-start">
        <Search />
      </InputGroupAddon>

      <InputGroupInput
        aria-label="Search by title"
        autoComplete="off"
        autoFocus
        disabled={disabled}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Search by title…"
        value={query}
      />

      <ShowIf condition={isBusy}>
        <InputGroupAddon align="inline-end">
          <Spinner />
        </InputGroupAddon>
      </ShowIf>

      <ShowIf condition={showClear && !isBusy}>
        <InputGroupAddon align="inline-end">
          <InputGroupButton aria-label="Clear search" onClick={handleClear} size="icon-xs">
            <X />
          </InputGroupButton>
        </InputGroupAddon>
      </ShowIf>
    </InputGroup>
  )
}
