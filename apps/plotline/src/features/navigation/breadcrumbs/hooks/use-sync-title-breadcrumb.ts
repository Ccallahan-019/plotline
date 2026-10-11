'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { useBreadcrumbOverride } from '../components/BreadcrumbOverrideProvider'
import { resolveTitleBreadcrumbLabel } from '../services/apply-breadcrumb-override'
import { readTitleBreadcrumbParent } from '../services/title-breadcrumb-parent'

/**
 * Publishes the open title, and the list it was opened from, into the header breadcrumbs.
 *
 * The parent is whatever library, search, or watchlist page last stored. Until this
 * effect runs for `pathname`, the title crumb stays a skeleton. A missing or blank
 * title settles to "Title Unavailable". `pathname` must be the route this page owns,
 * so a page still mounted during navigation cannot label the next URL. Other routes
 * ignore a leftover override, so leaving the title page does not clear it.
 *
 * @param pathname - Title route this label belongs to
 * @param title - Media title for the last crumb. `null` when the page has no title to show
 */
export function useSyncTitleBreadcrumb(pathname: string, title: null | string) {
  const { setOverride } = useBreadcrumbOverride()

  useEffect(() => {
    const parent = readTitleBreadcrumbParent()

    setOverride({
      parentHref: parent.href,
      parentLabel: parent.label,
      pathname,
      title: resolveTitleBreadcrumbLabel(title),
    })
  }, [pathname, setOverride, title])
}

/**
 * Publishes "Title Unavailable" for the title route that failed to load.
 *
 * The pathname is captured on mount so a later navigation cannot mark the next
 * title unavailable before that page settles.
 *
 * @returns void. The header breadcrumb updates as a side effect.
 */
export function useSyncUnavailableTitleBreadcrumb() {
  const pathname = usePathname()
  const [failedPath] = useState(pathname)

  useSyncTitleBreadcrumb(failedPath, null)
}
