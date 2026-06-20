import type { MediaStatus, MediaType } from '@plotline/shared/constants/media'

import type { LibraryItemSource } from '@/features/media-grid/filters/constants'

type BuildLibraryItemSearchParamsInput = {
  libraryItemIds?: null | number[]
  mediaTypes?: MediaType[]
  page?: number
  pageSize?: number
  sources?: LibraryItemSource[]
  statuses?: MediaStatus[]
}

export function buildLibraryItemSearchParams({
  libraryItemIds,
  mediaTypes,
  page = 1,
  pageSize = 24,
  sources,
  statuses,
}: BuildLibraryItemSearchParamsInput): Record<string, number | string> {
  const searchParams: Record<string, number | string> = {
    depth: 1,
    limit: pageSize,
    page,
    sort: '-lastWatchedAt',
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
