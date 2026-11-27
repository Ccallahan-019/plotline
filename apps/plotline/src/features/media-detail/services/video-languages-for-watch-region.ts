/**
 * Extra trailer languages to request for a watch region.
 *
 * Title details always include English and untagged videos. This adds the
 * region's primary language so a viewer in France or Japan still receives
 * trailers in that language. English-speaking regions add nothing.
 *
 * @param region - Profile watch region, such as `FR`
 * @returns Zero or one ISO 639-1 code
 */
export function videoLanguagesForWatchRegion(region: string): string[] {
  const language = primaryLanguageForRegion(region)

  if (!language || language === 'en') {
    return []
  }

  return [language]
}

// CLDR's most likely language for a region. An unknown region yields `null`.
function primaryLanguageForRegion(region: string): null | string {
  const code = region.trim().toUpperCase()

  if (!/^[A-Z]{2}$/.test(code)) {
    return null
  }

  try {
    const { language } = new Intl.Locale(`und-${code}`).maximize()

    if (language === 'und' || !/^[a-z]{2}$/.test(language)) {
      return null
    }

    return language
  } catch {
    return null
  }
}
