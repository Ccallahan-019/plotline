'use client'

import type { LibraryItem } from '@plotline/payload-types'

import { useState } from 'react'

import type { LibraryItemsResponse } from '@/features/library/library-grid/types'

import {
  buildContinueWatchingView,
  type ContinueWatchingSort,
  type ContinueWatchingTypeFilter,
  type ContinueWatchingView,
} from '../services/continue-watching'
import { useContinueWatchingRows } from './use-continue-watching-items'

type ContinueWatchingPageState = {
  libraryItems: ReadonlyMap<number, LibraryItem>
  mediaType: ContinueWatchingTypeFilter
  query: ReturnType<typeof useContinueWatchingRows>['query']
  setMediaType: (mediaType: ContinueWatchingTypeFilter) => void
  setSort: (sort: ContinueWatchingSort) => void
  sort: ContinueWatchingSort
} & ContinueWatchingView

type UseContinueWatchingPageOptions = {
  initialData?: LibraryItemsResponse
}

/**
 * Filter, sort, and watching rows for the continue-watching page.
 *
 * Chip counts stay on the full watching set. The media filter and sort apply
 * only to the titles left after the hero is chosen.
 *
 * @param options.initialData - Server-prefetched watching page for this same query
 * @returns The library query, the page view, and the filter controls
 */
export function useContinueWatchingPage(
  options?: UseContinueWatchingPageOptions,
): ContinueWatchingPageState {
  const [mediaType, setMediaType] = useState<ContinueWatchingTypeFilter>('all')
  const [sort, setSort] = useState<ContinueWatchingSort>('last-watched')
  const { libraryItems, query, rows } = useContinueWatchingRows(options)
  const view = buildContinueWatchingView(rows, { mediaType, sort })

  return {
    ...view,
    libraryItems,
    mediaType,
    query,
    setMediaType,
    setSort,
    sort,
  }
}
