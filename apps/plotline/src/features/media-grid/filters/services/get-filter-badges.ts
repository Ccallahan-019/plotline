import type { FilterBadge, FilterDefinition, FilterRenderContext, MediaFilters } from '../types'

export function countActiveFilters(
  filters: MediaFilters,
  definitions: FilterDefinition[],
  context: FilterRenderContext,
): number {
  return getFilterBadges(filters, definitions, context).length
}

export function getFilterBadges(
  filters: MediaFilters,
  definitions: FilterDefinition[],
  context: FilterRenderContext,
): FilterBadge[] {
  const badges: FilterBadge[] = []

  for (const definition of definitions) {
    const badge = definition.toBadge?.(filters, context)

    if (badge) {
      badges.push(badge)
    }
  }

  return badges
}

export function hasActiveFilterBadges(
  filters: MediaFilters,
  definitions: FilterDefinition[],
  context: FilterRenderContext,
): boolean {
  return countActiveFilters(filters, definitions, context) > 0
}
