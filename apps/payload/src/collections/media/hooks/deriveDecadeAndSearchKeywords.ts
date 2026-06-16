import type { CollectionBeforeChangeHook } from 'payload'

import { getDecadeFromReleaseDate } from '@plotline/shared/utils/dates'

export const deriveDecadeAndSearchKeywords: CollectionBeforeChangeHook = ({ data }) => {
  if (!data) {
    return data
  }

  data.decade = getDecadeFromReleaseDate(data.releaseDate) ?? undefined

  const keywords = [data.title, data.originalTitle]
    .filter((value): value is string => typeof value === 'string' && value.length > 0)
    .join(' ')
    .toLowerCase()

  data.searchKeywords = keywords.length > 0 ? keywords : undefined

  return data
}
