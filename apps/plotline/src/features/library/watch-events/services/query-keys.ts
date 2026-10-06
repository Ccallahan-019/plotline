export type WatchEventFilters = {
  limit?: number
  sort?: string
}

export const watchEventQueryKeys = {
  watchEvents: (filters?: WatchEventFilters) => ['watch-events', filters ?? {}] as const,
} as const

export const watchedEpisodeQueryKeys = {
  forLibraryItem: (libraryItemId: null | number | undefined) =>
    ['library-items', libraryItemId, 'watched-episodes'] as const,
} as const
