'use client'

import { ImageOff } from 'lucide-react'
import Image from 'next/image'

import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item'
import { Spinner } from '@/components/ui/spinner'
import { ShowIf } from '@/components/utils/ShowIf'
import {
  formatReleaseYear,
  getPosterUrl,
} from '@/features/media-grid/grid/services/media-display-helpers'
import { MIN_TMDB_QUERY_LENGTH } from '@/features/search/services/search-filters'
import { cn } from '@/lib/utils'

import type { TitleSearchRow } from '../../hooks/use-title-search-dialog'

type TitleSearchResultListProps = {
  canSearch: boolean
  isAwaitingResults: boolean
  isSearchError: boolean
  onSelect: (key: string) => void
  rows: TitleSearchRow[]
  selectedKey: null | string
  selectionDisabled: boolean
}

export function TitleSearchResultList({
  canSearch,
  isAwaitingResults,
  isSearchError,
  onSelect,
  rows,
  selectedKey,
  selectionDisabled,
}: TitleSearchResultListProps) {
  return (
    <div className="max-h-64 min-h-24 overflow-y-auto rounded-lg border">
      <TitleSearchResultBody
        canSearch={canSearch}
        isAwaitingResults={isAwaitingResults}
        isSearchError={isSearchError}
        onSelect={onSelect}
        rows={rows}
        selectedKey={selectedKey}
        selectionDisabled={selectionDisabled}
      />
    </div>
  )
}

function ResultMessage({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex min-h-24 items-center justify-center gap-2 px-3 text-center text-sm text-muted-foreground">
      {children}
    </p>
  )
}

function TitleSearchPoster({ posterPath }: { posterPath?: null | string }) {
  const posterUrl = getPosterUrl(posterPath)

  return (
    <div className="relative h-12 w-8 shrink-0 overflow-hidden rounded-sm bg-muted">
      {posterUrl ? (
        <Image alt="" className="object-cover" fill sizes="32px" src={posterUrl} />
      ) : (
        <div className="flex h-full items-center justify-center text-muted-foreground">
          <ImageOff aria-hidden className="size-3.5" />
        </div>
      )}
    </div>
  )
}

function TitleSearchResultBody({
  canSearch,
  isAwaitingResults,
  isSearchError,
  onSelect,
  rows,
  selectedKey,
  selectionDisabled,
}: TitleSearchResultListProps) {
  if (!canSearch) {
    return <ResultMessage>Type at least {MIN_TMDB_QUERY_LENGTH} characters.</ResultMessage>
  }

  if (isSearchError) {
    return <ResultMessage>Could not search titles. Try again.</ResultMessage>
  }

  if (rows.length === 0) {
    if (isAwaitingResults) {
      return (
        <ResultMessage>
          <Spinner />
          Searching...
        </ResultMessage>
      )
    }

    return <ResultMessage>No titles found.</ResultMessage>
  }

  return (
    <div aria-label="Search results" className="divide-y" role="listbox">
      {rows.map((row) => (
        <TitleSearchResultRow
          disabled={selectionDisabled}
          key={row.key}
          onSelect={onSelect}
          row={row}
          selected={row.key === selectedKey}
        />
      ))}
    </div>
  )
}

function TitleSearchResultRow({
  disabled,
  onSelect,
  row,
  selected,
}: {
  disabled: boolean
  onSelect: (key: string) => void
  row: TitleSearchRow
  selected: boolean
}) {
  const unavailable = row.classification.disabled
  const year = formatReleaseYear(row.display.releaseDate)
  const detail = [year, row.classification.reason].filter(Boolean).join(' · ')

  return (
    <Item
      className={cn(
        'w-full rounded-none text-left',
        !unavailable && !selected && 'hover:bg-muted/60',
        unavailable && 'cursor-not-allowed opacity-60',
      )}
      render={
        <button
          aria-selected={selected}
          disabled={unavailable || disabled}
          onClick={() => onSelect(row.key)}
          role="option"
          type="button"
        />
      }
      size="sm"
      variant={selected ? 'muted' : 'default'}
    >
      <ItemMedia>
        <TitleSearchPoster posterPath={row.display.posterPath} />
      </ItemMedia>
      <ItemContent className="min-w-0">
        <ItemTitle className="w-full">{row.display.title}</ItemTitle>
        <ShowIf condition={detail.length > 0}>
          <ItemDescription className="line-clamp-1">{detail}</ItemDescription>
        </ShowIf>
      </ItemContent>
    </Item>
  )
}
