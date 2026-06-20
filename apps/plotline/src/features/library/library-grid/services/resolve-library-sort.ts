import { DEFAULT_LIBRARY_SORT, type LibrarySort } from '../types'

export function parseLibrarySort(value: null | string): LibrarySort {
  switch (value) {
    case 'completed':
    case 'recently-added':
    case 'recently-updated':
    case 'started':
      return value
    case 'recently-watched':
    default:
      return DEFAULT_LIBRARY_SORT
  }
}

export function resolveLibrarySort(sort: LibrarySort): string {
  switch (sort) {
    case 'completed':
      return '-completedAt'
    case 'recently-added':
      return '-createdAt'
    case 'recently-updated':
      return '-updatedAt'
    case 'started':
      return '-startedAt'
    case 'recently-watched':
    default:
      return '-lastWatchedAt'
  }
}
