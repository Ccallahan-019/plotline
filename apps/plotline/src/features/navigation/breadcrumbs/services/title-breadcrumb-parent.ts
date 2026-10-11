export type TitleBreadcrumbParent = {
  href: string
  label: string
}

const STORAGE_KEY = 'plotline-title-breadcrumb-parent'

export const DEFAULT_TITLE_BREADCRUMB_PARENT: TitleBreadcrumbParent = {
  href: '/dashboard/library',
  label: 'Library',
}

/**
 * Forgets the stored parent, so the next title page uses the default.
 *
 * Storage failures are ignored: the breadcrumb is a convenience and must not break a link click.
 */
export function clearTitleBreadcrumbParent(): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // Storage can be blocked or full. The title page falls back to the default parent.
  }
}

/**
 * Reads a stored breadcrumb parent.
 *
 * @param value - Unknown JSON from session storage
 * @returns The parent when `href` is a same-site path and `label` is non-empty, otherwise `null`
 */
export function parseTitleBreadcrumbParent(value: unknown): null | TitleBreadcrumbParent {
  if (typeof value !== 'object' || value == null) {
    return null
  }

  if (!('href' in value) || !('label' in value)) {
    return null
  }

  const { href, label } = value

  if (typeof href !== 'string' || typeof label !== 'string') {
    return null
  }

  const trimmedHref = href.trim()
  const trimmedLabel = label.trim()

  if (!trimmedHref.startsWith('/') || trimmedHref.startsWith('//') || !trimmedLabel) {
    return null
  }

  return { href: trimmedHref, label: trimmedLabel }
}

/**
 * Reads the list the user last opened, used as the title page's breadcrumb parent.
 *
 * @returns The stored parent, or Library when nothing valid is stored
 */
export function readTitleBreadcrumbParent(): TitleBreadcrumbParent {
  if (typeof window === 'undefined') {
    return DEFAULT_TITLE_BREADCRUMB_PARENT
  }

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)

    if (!raw) {
      return DEFAULT_TITLE_BREADCRUMB_PARENT
    }

    return parseTitleBreadcrumbParent(JSON.parse(raw)) ?? DEFAULT_TITLE_BREADCRUMB_PARENT
  } catch {
    return DEFAULT_TITLE_BREADCRUMB_PARENT
  }
}

/**
 * Remembers which list a title link was opened from.
 *
 * Storage failures are ignored: the breadcrumb is a convenience and must not break a link click.
 *
 * @param parent - Section label and href shown above the title crumb
 */
export function writeTitleBreadcrumbParent(parent: TitleBreadcrumbParent): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(parent))
  } catch {
    // Storage can be blocked or full. The title page falls back to the default parent.
  }
}
