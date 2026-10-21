import { fetchJson } from '@/lib/api/fetch-json'

import type { TrendingTitles } from '../types'

/**
 * Loads the mixed weekly trending list.
 *
 * @returns Movies and series interleaved from TMDB's weekly charts
 */
export function fetchTrendingTitles(): Promise<TrendingTitles> {
  return fetchJson<TrendingTitles>('/api/tmdb/trending')
}
