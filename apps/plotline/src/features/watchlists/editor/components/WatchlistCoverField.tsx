'use client'

import type { LibraryItem } from '@plotline/payload-types'
import type { MediaType } from '@plotline/shared/constants'

import { useMemo } from 'react'

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
import { Spinner } from '@/components/ui/spinner'
import { ShowIf } from '@/components/utils/ShowIf'
import { useLibraryItemsLookup } from '@/features/library/library-grid/hooks/use-library-items-lookup'
import {
  formatReleaseYear,
  getMediaFromLibraryItem,
} from '@/features/media-grid/grid/services/media-display-helpers'

export type WatchlistCoverOption = {
  id: number
  label: string
  mediaType: MediaType
  year: null | string
}

type WatchlistCoverFieldProps = {
  disabled?: boolean
  fallback?: null | WatchlistCoverOption
  id?: string
  onBlur?: () => void
  onChange: (mediaId: null | number) => void
  value: null | number
}

export function WatchlistCoverField({
  disabled = false,
  fallback = null,
  id,
  onBlur,
  onChange,
  value,
}: WatchlistCoverFieldProps) {
  const libraryQuery = useLibraryItemsLookup()
  const options = useMemo(
    () => mergeCoverOptions(toCoverOptions(libraryQuery.data ?? []), fallback),
    [fallback, libraryQuery.data],
  )
  const selected = options.find((option) => option.id === value) ?? null
  const emptyMessage = libraryQuery.isPending
    ? 'Loading your library…'
    : libraryQuery.isError
      ? 'Could not load your library.'
      : options.length === 0
        ? 'No titles in your library yet.'
        : 'No matching titles'

  const handleValueChange = (option: null | WatchlistCoverOption) => {
    onChange(option?.id ?? null)
  }

  return (
    <Combobox
      disabled={disabled}
      isItemEqualToValue={(left, right) => left?.id === right?.id}
      items={options}
      itemToStringLabel={(item) => item?.label ?? ''}
      onValueChange={handleValueChange}
      value={selected}
    >
      <ComboboxInput
        className="w-full"
        disabled={disabled}
        id={id}
        onBlur={onBlur}
        placeholder="Search your library..."
        showClear
      >
        <ShowIf condition={libraryQuery.isPending}>
          <span className="sr-only">Loading library</span>
          <Spinner className="absolute top-1/2 right-8 size-3.5 -translate-y-1/2" />
        </ShowIf>
      </ComboboxInput>
      <ComboboxContent>
        <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
        <ComboboxList>
          {(item: WatchlistCoverOption) => (
            <ComboboxItem key={item.id} value={item}>
              <span className="truncate">{item.label}</span>
              <span className="text-muted-foreground">
                {item.mediaType === 'movie' ? 'Film' : 'Series'}
                {item.year ? ` · ${item.year}` : ''}
              </span>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

function mergeCoverOptions(
  options: WatchlistCoverOption[],
  fallback: null | WatchlistCoverOption,
): WatchlistCoverOption[] {
  if (fallback == null || options.some((option) => option.id === fallback.id)) {
    return options
  }

  return [fallback, ...options]
}

function toCoverOptions(items: LibraryItem[]): WatchlistCoverOption[] {
  const byId = new Map<number, WatchlistCoverOption>()

  for (const item of items) {
    const media = getMediaFromLibraryItem(item)

    if (!media || byId.has(media.id)) {
      continue
    }

    byId.set(media.id, {
      id: media.id,
      label: media.title,
      mediaType: media.mediaType,
      year: formatReleaseYear(media.releaseDate),
    })
  }

  return [...byId.values()].sort((left, right) => left.label.localeCompare(right.label))
}
