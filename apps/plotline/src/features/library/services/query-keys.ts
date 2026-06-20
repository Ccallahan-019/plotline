export type ReviewFilters = {
  hasBody?: boolean
}

export const reviewQueryKeys = {
  reviews: (filters?: ReviewFilters) => ['reviews', filters ?? {}] as const,
} as const
