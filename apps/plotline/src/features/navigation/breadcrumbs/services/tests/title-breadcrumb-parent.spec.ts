import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  clearTitleBreadcrumbParentIf,
  DEFAULT_TITLE_BREADCRUMB_PARENT,
  readTitleBreadcrumbParent,
  writeTitleBreadcrumbParent,
} from '../title-breadcrumb-parent'

const LIBRARY = { href: '/dashboard/library', label: 'Library' }
const FAVORITES = { href: '/dashboard/watchlists/favorites', label: 'Favorites' }

describe('clearTitleBreadcrumbParentIf', () => {
  beforeEach(() => {
    const store = new Map<string, string>()

    vi.stubGlobal('window', {
      sessionStorage: {
        getItem: (key: string) => store.get(key) ?? null,
        removeItem: (key: string) => store.delete(key),
        setItem: (key: string, value: string) => store.set(key, value),
      },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('removes the entry when it is still the given parent', () => {
    writeTitleBreadcrumbParent(FAVORITES)
    clearTitleBreadcrumbParentIf(FAVORITES)

    expect(readTitleBreadcrumbParent()).toEqual(DEFAULT_TITLE_BREADCRUMB_PARENT)
  })

  it('leaves a parent that another list stored since', () => {
    writeTitleBreadcrumbParent(LIBRARY)
    clearTitleBreadcrumbParentIf(FAVORITES)

    expect(readTitleBreadcrumbParent()).toEqual(LIBRARY)
  })
})
