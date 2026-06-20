import type { MediaStatus, MediaType } from '@plotline/shared/constants/media'

import type { LibraryItemSource } from '@/features/media-grid/filters/constants'

import { DEFAULT_LIBRARY_SORT, type LibrarySort } from '@/features/library/library-grid/types'

import { resolveLibrarySort } from './resolve-library-sort'

type BuildLibraryItemSearchParamsInput = {
  excludeLibraryItemIds?: number[]
  libraryItemIds?: null | number[]
  mediaTypes?: MediaType[]
  page?: number
  pageSize?: number
  sort?: LibrarySort
  sources?: LibraryItemSource[]
  statuses?: MediaStatus[]
}

export function buildLibraryItemSearchParams({
  excludeLibraryItemIds,
  libraryItemIds,
  mediaTypes,
  page = 1,
  pageSize = 24,
  sort,
  sources,
  statuses,
}: BuildLibraryItemSearchParamsInput): Record<string, number | string> {
  const searchParams: Record<string, number | string> = {
    depth: 1,
    limit: pageSize,
    page,
    sort: resolveLibrarySort(sort ?? DEFAULT_LIBRARY_SORT),
  }

  if (statuses?.length) {
    appendInFilter(searchParams, 'status', statuses)
  }

  if (mediaTypes?.length) {
    appendInFilter(searchParams, 'progress.type', mediaTypes)
  }

  if (sources?.length) {
    appendInFilter(searchParams, 'source', sources)
  }

  if (libraryItemIds) {
    appendInFilter(searchParams, 'id', libraryItemIds)
  }

  if (excludeLibraryItemIds?.length) {
    appendNotInFilter(searchParams, 'id', excludeLibraryItemIds)
  }

  return searchParams
}

function appendInFilter(
  params: Record<string, number | string>,
  field: string,
  values: Array<number | string>,
) {
  values.forEach((value, index) => {
    params[`where[${field}][in][${index}]`] = value
  })
}

function appendNotInFilter(
  params: Record<string, number | string>,
  field: string,
  values: Array<number | string>,
) {
  values.forEach((value, index) => {
    params[`where[${field}][not_in][${index}]`] = value
  })
}
