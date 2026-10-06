import type { BreadcrumbRoute, BreadcrumbSegment } from '../types'

import { breadcrumbRouteMap, dynamicBreadcrumbRoutes, formatSlugLabel } from './breadcrumb-routes'

const homeSegment: BreadcrumbSegment = {
  href: '/dashboard',
  kind: 'overview',
  label: 'Overview',
}

const hiddenPathPrefixes = ['/sign-in', '/sign-up']

export function getBreadcrumbs(pathname: string): BreadcrumbSegment[] {
  if (pathname === '/' || hiddenPathPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return []
  }

  if (pathname === '/dashboard') {
    return [{ kind: 'overview', label: homeSegment.label }]
  }

  const route = breadcrumbRouteMap.get(pathname) ?? resolveDynamicRoute(pathname)

  if (route) {
    return buildTrailFromRoute(pathname, route)
  }

  return buildFallbackTrail(pathname)
}

function buildFallbackTrail(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)
  const crumbs: BreadcrumbSegment[] = [homeSegment]

  let currentPath = ''

  for (const [index, segment] of segments.entries()) {
    currentPath += `/${segment}`
    const isLast = index === segments.length - 1

    crumbs.push({
      href: isLast ? undefined : currentPath,
      label: formatSlugLabel(segment),
    })
  }

  return finalizeTrail(crumbs)
}

function buildTrailFromRoute(pathname: string, route: BreadcrumbRoute) {
  const crumbs: BreadcrumbSegment[] = [homeSegment]

  if (
    route.section &&
    route.sectionHref &&
    route.sectionHref !== pathname &&
    route.sectionHref !== homeSegment.href
  ) {
    crumbs.push({ href: route.sectionHref, label: route.section })
  }

  if (route.groupLabel) {
    crumbs.push({ label: route.groupLabel })
  }

  crumbs.push({
    href: pathname === route.sectionHref ? route.sectionHref : undefined,
    label: route.label,
  })

  return finalizeTrail(crumbs)
}

function finalizeTrail(crumbs: BreadcrumbSegment[]) {
  const lastCrumb = crumbs.at(-1)

  if (!lastCrumb) {
    return []
  }

  return crumbs.map((crumb, index) =>
    index === crumbs.length - 1 ? { label: crumb.label } : crumb,
  )
}

function resolveDynamicRoute(pathname: string): BreadcrumbRoute | undefined {
  for (const route of dynamicBreadcrumbRoutes) {
    const match = pathname.match(route.pattern)

    if (!match?.[1]) {
      continue
    }

    return {
      label: route.formatLabel(match[1]),
      section: route.parentLabel,
      sectionHref: route.parentHref,
    }
  }

  return undefined
}
