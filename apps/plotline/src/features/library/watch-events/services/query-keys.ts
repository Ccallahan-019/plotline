export type WatchEventFilters = {
  limit?: number
  sort?: string
}

export const watchEventQueryKeys = {
  watchEvents: (filters?: WatchEventFilters) => ['watch-events', filters ?? {}] as const,
} as const
