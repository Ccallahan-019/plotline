const ENGLISH_VIDEO_LANGUAGE = 'en'
const MAX_VIDEO_LANGUAGES = 5
const RESERVED_VIDEO_LANGUAGES: readonly string[] = [ENGLISH_VIDEO_LANGUAGE, 'null']

/**
 * TMDB `include_video_language` value for a title-details request.
 *
 * English videos and videos with no language are always included. Extra codes
 * are placed first. TMDB returns an empty video list when too many codes are
 * sent, so the value never exceeds five codes.
 *
 * @param languages - Extra ISO 639-1 codes, such as a viewer's language
 * @returns A comma-separated language list
 */
export function includeVideoLanguage(languages?: readonly string[]): string {
  const extras = normalizedVideoLanguages(languages ?? []).filter(
    (code) => !RESERVED_VIDEO_LANGUAGES.includes(code),
  )
  const roomForExtras = MAX_VIDEO_LANGUAGES - RESERVED_VIDEO_LANGUAGES.length

  return [...extras.slice(0, roomForExtras), ...RESERVED_VIDEO_LANGUAGES].join(',')
}

// ISO 639-1 codes in caller order, without blanks or duplicates. `en-US` becomes `en`.
function normalizedVideoLanguages(languages: readonly string[]): string[] {
  const codes: string[] = []

  for (const language of languages) {
    const code = normalizeVideoLanguage(language)

    if (!code || codes.includes(code)) {
      continue
    }

    codes.push(code)
  }

  return codes
}

function normalizeVideoLanguage(language: string): null | string {
  const trimmed = language.trim().toLowerCase()

  if (trimmed === 'null') {
    return 'null'
  }

  const languageCode = trimmed.split('-')[0]

  if (!languageCode || !/^[a-z]{2}$/.test(languageCode)) {
    return null
  }

  return languageCode
}
