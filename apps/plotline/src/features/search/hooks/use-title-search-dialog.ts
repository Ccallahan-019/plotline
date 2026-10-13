'use client'

import type { LibraryItem } from '@plotline/payload-types'
import type { MediaStatus } from '@plotline/shared/constants'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import type { MediaDisplay } from '@/features/media-grid/types'

import { useLibraryItemsLookup } from '@/features/library/library-grid/hooks/use-library-items-lookup'
import { FetchJsonError } from '@/lib/api/fetch-json'

import { buildLibraryItemLookupByTmdb } from '../services/build-library-item-lookup'
import {
  classifyTitleSearchRow,
  shouldShowTitleSearchStatus,
  type TitleSearchDestination,
  type TitleSearchRowClassification,
} from '../services/classify-title-search-row'
import { isBrowseRequestEnabled } from '../services/search-filters'
import { type TitleSearchHit, toTitleSearchHits } from '../services/to-title-search-hits'
import { DEFAULT_SEARCH_MEDIA_TYPE, type SearchMediaType } from '../types'
import { useTmdbSearch } from './use-tmdb-search'

const EMPTY_ON_LIST_KEYS: ReadonlySet<string> = new Set()

export type TitleSearchAddInput = {
  display: MediaDisplay
  libraryItem?: LibraryItem
  media: TitleSearchHit['media']
  /** Set when the dialog is collecting a status for a new library row. */
  status?: MediaStatus
}

export type TitleSearchRow = {
  classification: TitleSearchRowClassification
  libraryItem?: LibraryItem
} & TitleSearchHit

type UseTitleSearchDialogOptions = {
  destination: TitleSearchDestination
  /** Saves the selected title. Reject on failure, and do not toast. */
  onAdd: (input: TitleSearchAddInput) => Promise<unknown>
  /** `movie:550` style keys from `getLibraryItemLookupKey` already on the current list. */
  onListKeys?: ReadonlySet<string>
  /** When false, search and library lookup do not run. */
  open: boolean
}

/**
 * Search, library lookup, and add flow for the shared title dialog.
 *
 * TMDB search is debounced and stays in search mode. Library lookup runs only
 * while `open` is true. A successful add keeps the dialog open, clears the
 * selection, marks that hit unavailable, and toasts. A rejected `onAdd` keeps
 * the selection; the failure is toasted and not rethrown.
 *
 * @param options.destination - Library or watchlist rules for disabling rows and status
 * @param options.onAdd - Saves the selected title. Reject on failure. Do not toast
 * @param options.onListKeys - Keys already on the current watchlist
 * @param options.open - When false, search and library lookup do not run
 * @returns Field state, result rows, and `reset` to call when the dialog closes
 */
export function useTitleSearchDialog({
  destination,
  onAdd,
  onListKeys,
  open,
}: UseTitleSearchDialogOptions) {
  const [addedKeys, setAddedKeys] = useState<ReadonlySet<string>>(() => new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mediaType, setMediaTypeState] = useState<SearchMediaType>(DEFAULT_SEARCH_MEDIA_TYPE)
  const [query, setQuery] = useState('')
  const [selectedKey, setSelectedKey] = useState<null | string>(null)
  const [status, setStatus] = useState<MediaStatus>('planned')

  const search = useTmdbSearch(query, { enabled: open, mediaType })
  const libraryQuery = useLibraryItemsLookup({ enabled: open })
  const listKeys = onListKeys ?? EMPTY_ON_LIST_KEYS
  const trimmedQuery = query.trim()
  const canSearch = isBrowseRequestEnabled('search', trimmedQuery)
  const isSearchBusy = canSearch && (trimmedQuery !== search.debouncedQuery || search.isFetching)

  const lookup = useMemo(
    () => buildLibraryItemLookupByTmdb(libraryQuery.data ?? []),
    [libraryQuery.data],
  )
  const hits = useMemo(
    () => (canSearch ? toTitleSearchHits(search.data?.results ?? []) : []),
    [canSearch, search.data?.results],
  )
  const rows = useMemo(
    () =>
      hits.map((hit) => {
        const libraryItem = lookup.get(hit.key)
        const savedInThisDialog = addedKeys.has(hit.key)

        return {
          ...hit,
          classification: classifyTitleSearchRow({
            destination,
            inLibrary: libraryItem != null || (destination === 'library' && savedInThisDialog),
            onList: listKeys.has(hit.key) || (destination === 'watchlist' && savedInThisDialog),
          }),
          libraryItem,
        }
      }),
    [addedKeys, destination, hits, listKeys, lookup],
  )

  const selectedRow = rows.find((row) => row.key === selectedKey)
  const activeSelection =
    selectedRow != null && !selectedRow.classification.disabled ? selectedRow : null
  const libraryLookupPending = open && libraryQuery.isPending
  const showStatus = shouldShowTitleSearchStatus(
    destination,
    activeSelection?.classification ?? null,
  )
  const canSubmit = activeSelection != null && !isSubmitting && !libraryLookupPending
  const isAwaitingResults = canSearch && hits.length === 0 && !search.isError && isSearchBusy
  const isSearchError = canSearch && search.isError && !search.isFetching

  function reset() {
    setAddedKeys(new Set())
    setMediaTypeState(DEFAULT_SEARCH_MEDIA_TYPE)
    setQuery('')
    setSelectedKey(null)
    setStatus('planned')
  }

  function selectRow(key: string) {
    if (isSubmitting) {
      return
    }

    const row = rows.find((item) => item.key === key)

    if (row == null || row.classification.disabled) {
      return
    }

    setSelectedKey(key)
  }

  function setMediaType(nextMediaType: SearchMediaType) {
    setMediaTypeState(nextMediaType)
    setSelectedKey(null)
  }

  async function submit() {
    if (activeSelection == null || isSubmitting || libraryLookupPending) {
      return
    }

    const { classification, display, key, libraryItem, media } = activeSelection
    setIsSubmitting(true)

    try {
      await onAdd({
        display,
        libraryItem,
        media,
        status: classification.showStatus ? status : undefined,
      })
      setAddedKeys((current) => new Set(current).add(key))
      setSelectedKey(null)
      setStatus('planned')

      const success = titleSearchSuccessCopy(destination, display.title)
      toast.success(success.message, { description: success.description })
    } catch (error) {
      const failure = titleSearchErrorCopy(destination, error)
      toast.error(failure.message, { description: failure.description })
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    canSearch,
    canSubmit,
    isAwaitingResults,
    isSearchBusy,
    isSearchError,
    isSubmitting,
    libraryLookupPending,
    mediaType,
    query,
    reset,
    rows,
    selectedKey: activeSelection?.key ?? null,
    selectRow,
    setMediaType,
    setQuery,
    setStatus,
    showStatus,
    status,
    submit,
  }
}

// 409 means the title was saved after lookup, so the generic failure copy would be misleading.
function titleSearchErrorCopy(
  destination: TitleSearchDestination,
  error: unknown,
): { description: string; message: string } {
  if (error instanceof FetchJsonError && error.status === 409) {
    if (destination === 'library') {
      return {
        description: 'That title is already in your library.',
        message: 'Already in your library',
      }
    }

    return {
      description: 'That title is already on this list.',
      message: 'Already on this list',
    }
  }

  if (destination === 'library') {
    return {
      description: 'There was an error adding this title. Please try again.',
      message: 'Could not add to library',
    }
  }

  return {
    description: 'There was an error adding this title. Please try again.',
    message: 'Could not add to list',
  }
}

// Confirms the title landed. The dialog stays open so another title can be added.
function titleSearchSuccessCopy(
  destination: TitleSearchDestination,
  title: string,
): { description: string; message: string } {
  if (destination === 'library') {
    return {
      description: `${title} is in your library.`,
      message: 'Added to library',
    }
  }

  return {
    description: `${title} was added to this list.`,
    message: 'Added to list',
  }
}
