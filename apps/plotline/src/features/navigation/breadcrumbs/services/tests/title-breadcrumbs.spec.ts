import { describe, expect, it } from 'vitest'

import { applyBreadcrumbOverride, resolveTitleBreadcrumbLabel } from '../apply-breadcrumb-override'
import { getBreadcrumbs } from '../get-breadcrumbs'
import { parseTitleBreadcrumbParent } from '../title-breadcrumb-parent'

describe('title breadcrumbs', () => {
  it('keeps a skeleton under Library until the page supplies the name', () => {
    expect(getBreadcrumbs('/dashboard/title/movie/550')).toEqual([
      { href: '/dashboard', kind: 'overview', label: 'Overview' },
      { href: '/dashboard/library', label: 'Library' },
      { kind: 'pending', label: '' },
    ])
  })

  it('replaces the parent and title from the page', () => {
    const segments = getBreadcrumbs('/dashboard/title/tv/95396')

    expect(
      applyBreadcrumbOverride(segments, '/dashboard/title/tv/95396', {
        parentHref: '/dashboard/watchlists/favorites',
        parentLabel: 'Favorites',
        pathname: '/dashboard/title/tv/95396',
        title: 'Severance',
      }),
    ).toEqual([
      { href: '/dashboard', kind: 'overview', label: 'Overview' },
      { href: '/dashboard/watchlists/favorites', label: 'Favorites' },
      { label: 'Severance' },
    ])
  })

  it('keeps the skeleton when the override is for a different title', () => {
    const segments = getBreadcrumbs('/dashboard/title/tv/95396')

    expect(
      applyBreadcrumbOverride(segments, '/dashboard/title/tv/95396', {
        parentHref: '/dashboard/library',
        parentLabel: 'Library',
        pathname: '/dashboard/title/movie/550',
        title: 'Fight Club',
      }),
    ).toEqual(segments)
  })

  it('falls back when the title is missing or blank', () => {
    expect(resolveTitleBreadcrumbLabel(null)).toBe('Title Unavailable')
    expect(resolveTitleBreadcrumbLabel('   ')).toBe('Title Unavailable')
    expect(resolveTitleBreadcrumbLabel(' Severance ')).toBe('Severance')
  })

  it('rejects a breadcrumb parent that is not an internal path', () => {
    expect(parseTitleBreadcrumbParent({ href: 'https://example.com', label: 'Library' })).toBeNull()
    expect(parseTitleBreadcrumbParent({ href: '/dashboard/search', label: 'Discover' })).toEqual({
      href: '/dashboard/search',
      label: 'Discover',
    })
  })
})
