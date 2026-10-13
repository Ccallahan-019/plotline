import type { BreadcrumbSegment } from '../types'

const TITLE_PATH = /^\/dashboard\/title\/(?:movie|tv)\/\d+$/

const TITLE_BREADCRUMB_UNAVAILABLE = 'Title Unavailable'

export type BreadcrumbOverride = {
  parentHref: string
  parentLabel: string
  pathname: string
  title: string
}

/**
 * Replaces the title route's parent and skeleton once the page knows them.
 *
 * An override for a different title path is ignored, so the crumb stays a skeleton
 * while the next title is still loading.
 *
 * @param segments - Crumbs from the pathname route map
 * @param pathname - Current location
 * @param override - Title and the list the user came from; `null` leaves the map unchanged
 * @returns The trail to render
 */
export function applyBreadcrumbOverride(
  segments: BreadcrumbSegment[],
  pathname: string,
  override: BreadcrumbOverride | null,
): BreadcrumbSegment[] {
  if (
    !override ||
    override.pathname !== pathname ||
    !TITLE_PATH.test(pathname) ||
    segments.length < 2
  ) {
    return segments
  }

  return segments.map((segment, index) => {
    if (index === segments.length - 1) {
      return { label: override.title }
    }

    if (index === 1) {
      return { href: override.parentHref, label: override.parentLabel }
    }

    return segment
  })
}

/**
 * Label for the title crumb once the page has a result.
 *
 * @param title - Media title from the page, or `null` when it could not be loaded
 * @returns The trimmed title, or `Title Unavailable` when it is missing or blank
 */
export function resolveTitleBreadcrumbLabel(title: null | string | undefined): string {
  const trimmed = title?.trim() ?? ''

  return trimmed.length > 0 ? trimmed : TITLE_BREADCRUMB_UNAVAILABLE
}
