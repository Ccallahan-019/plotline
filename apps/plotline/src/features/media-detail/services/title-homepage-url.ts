/**
 * Official site URL safe to open from the title poster.
 *
 * TMDB sends an empty string when a title has no site, and sometimes an http URL.
 * Only an https URL is returned.
 *
 * @param homepage - TMDB `homepage` value
 * @returns The trimmed https URL, or null
 */
export function titleHomepageUrl(homepage: null | string | undefined): null | string {
  const trimmed = homepage?.trim()

  if (!trimmed) {
    return null
  }

  try {
    return new URL(trimmed).protocol === 'https:' ? trimmed : null
  } catch {
    return null
  }
}
