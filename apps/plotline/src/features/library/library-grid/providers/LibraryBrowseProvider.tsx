'use client'

import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import type { LibraryItemsResponse } from '@/features/library/library-grid/types'

import { useLibraryGridItems } from '@/features/library/library-grid/hooks/use-library-grid-items'
import {
  DEFAULT_LIBRARY_PAGE_SIZE,
  DEFAULT_LIBRARY_SORT,
  type LibrarySort,
} from '@/features/library/library-grid/types'
import { useFilters } from '@/features/media-grid/filters/providers/FiltersProvider'
import { getErrorMessage } from '@/utils/get-error-message'

type LibraryBrowseContextValue = {
  errorMessage: null | string
  isFetching: boolean
  isInitialLoading: boolean
  libraryItems: LibraryItemsResponse | undefined
  page: number
  pageSize: number
  setPage: (page: number) => void
  setPageSize: (pageSize: number) => void
  setSort: (sort: LibrarySort) => void
  sort: LibrarySort
  totalPages: number
  totalResults: number
}

const LibraryBrowseContext = createContext<LibraryBrowseContextValue | null>(null)

type LibraryBrowseProviderProps = PropsWithChildren<{
  initialData: LibraryItemsResponse
  initialError?: null | string
}>

export function LibraryBrowseProvider({
  children,
  initialData,
  initialError = null,
}: LibraryBrowseProviderProps) {
  const { appliedFilters } = useFilters()
  const [page, setPage] = useState(initialData.page)
  const [pageSize, setPageSize] = useState(initialData.limit || DEFAULT_LIBRARY_PAGE_SIZE)
  const [sort, setSort] = useState<LibrarySort>(DEFAULT_LIBRARY_SORT)

  const initialQuery = useMemo(
    () => ({
      filters: {},
      page: initialData.page,
      pageSize: initialData.limit,
      sort: DEFAULT_LIBRARY_SORT,
    }),
    [initialData.limit, initialData.page],
  )

  const query = useMemo(
    () => ({
      filters: appliedFilters,
      page,
      pageSize,
      sort,
    }),
    [appliedFilters, page, pageSize, sort],
  )

  const { data, error, isFetching, isLoading } = useLibraryGridItems(query, {
    initialData,
    initialQuery,
  })

  const setPageCallback = useCallback(
    (nextPage: number) => {
      if (data && nextPage > data.totalPages) {
        return
      }

      setPage(Math.max(1, nextPage))
    },
    [data],
  )

  const setPageSizeCallback = useCallback((nextPageSize: number) => {
    setPageSize(nextPageSize)
    setPage(1)
  }, [])

  useEffect(() => {
    setPage(1)
  }, [appliedFilters])

  const value = useMemo(
    (): LibraryBrowseContextValue => ({
      errorMessage: getErrorMessage(error) ?? initialError,
      isFetching,
      isInitialLoading: isLoading,
      libraryItems: data,
      page,
      pageSize,
      setPage: setPageCallback,
      setPageSize: setPageSizeCallback,
      setSort,
      sort,
      totalPages: data?.totalPages ?? 1,
      totalResults: data?.totalDocs ?? 0,
    }),
    [
      data,
      error,
      initialError,
      isFetching,
      isLoading,
      page,
      pageSize,
      setPageCallback,
      setPageSizeCallback,
      sort,
    ],
  )

  return <LibraryBrowseContext.Provider value={value}>{children}</LibraryBrowseContext.Provider>
}

export function useLibraryBrowse() {
  const context = useContext(LibraryBrowseContext)

  if (!context) {
    throw new Error('useLibraryBrowse must be used within LibraryBrowseProvider')
  }

  return context
}
