import type { LibraryItemsQuery, LibraryItemsResponse } from '@/features/library/library-grid/types'

import {
  getAllLibraryItems,
  getLibraryItems,
} from '@/features/library/library-grid/services/get-library-items'
import { PayloadClientError } from '@/lib/payload/payload-fetch'

const EMPTY_LIBRARY_ITEMS_RESPONSE: LibraryItemsResponse = {
  docs: [],
  limit: 24,
  page: 1,
  totalDocs: 0,
  totalPages: 1,
}

export async function getInitialLibraryItems(clerkUserId: string, query: LibraryItemsQuery = {}) {
  let initialError: null | string = null
  let initialLibraryItems: LibraryItemsResponse = EMPTY_LIBRARY_ITEMS_RESPONSE

  try {
    initialLibraryItems = await getLibraryItems(clerkUserId, query.filters, {
      page: query.page,
      pageSize: query.pageSize,
    })
  } catch (error) {
    if (error instanceof PayloadClientError && error.status === 404) {
      initialLibraryItems = EMPTY_LIBRARY_ITEMS_RESPONSE
    } else if (error instanceof Error) {
      initialError = error.message
    } else {
      initialError = 'Failed to load library items'
    }
  }

  return { initialError, initialLibraryItems }
}

export async function getInitialLibraryItemsLookup(clerkUserId: string) {
  let initialError: null | string = null
  let initialLibraryItems: Awaited<ReturnType<typeof getAllLibraryItems>> = []

  try {
    initialLibraryItems = await getAllLibraryItems(clerkUserId)
  } catch (error) {
    if (error instanceof PayloadClientError && error.status === 404) {
      initialLibraryItems = []
    } else if (error instanceof Error) {
      initialError = error.message
    } else {
      initialError = 'Failed to load library items'
    }
  }

  return { initialError, initialLibraryItems }
}
