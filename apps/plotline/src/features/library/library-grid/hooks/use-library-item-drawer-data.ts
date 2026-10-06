'use client'

import type { LibraryItem } from '@plotline/payload-types'

import { useMemo } from 'react'

import { useWatchlistMemberships } from '@/features/library/add-to-list/hooks/use-watchlist-memberships'
import { getMediaFromLibraryItem } from '@/features/library/services/get-media-from-library-item'
import { toMediaDisplayFromMedia } from '@/features/media-grid/grid/services/media-display-helpers'

import type { LibraryItemDrawerViewModel } from '../types'

import { toLibraryItemDrawerViewModel } from '../services/to-library-item-drawer-view-model'

type UseLibraryItemDrawerDataOptions = {
  enabled?: boolean
}

type UseLibraryItemDrawerDataResult = {
  isLoadingWatchlists: boolean
  viewModel: LibraryItemDrawerViewModel | null
}

export function useLibraryItemDrawerData(
  item: LibraryItem,
  options?: UseLibraryItemDrawerDataOptions,
): UseLibraryItemDrawerDataResult {
  const enabled = options?.enabled ?? true
  const media = getMediaFromLibraryItem(item)

  const { data: memberships, isLoading: isLoadingWatchlists } = useWatchlistMemberships(item.id, {
    enabled: enabled && media != null,
  })

  const viewModel = useMemo(() => {
    if (!media) {
      return null
    }

    const mediaDisplay = toMediaDisplayFromMedia(media)

    return toLibraryItemDrawerViewModel({
      item,
      media,
      mediaDisplay,
      memberships: memberships ?? [],
    })
  }, [item, media, memberships])

  return {
    isLoadingWatchlists,
    viewModel,
  }
}
