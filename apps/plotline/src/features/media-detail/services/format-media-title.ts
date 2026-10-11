import type { Media } from '@plotline/payload-types'

import { getStreamingPlatformMeta } from '@plotline/shared/constants'
import { format, isValid, parseISO } from 'date-fns'

import { suggestNextEpisode } from '@/features/library/log-watch/services/log-watch-form'
import {
  formatReleaseYear,
  formatRuntime,
  formatSeasonCount,
} from '@/features/media-grid/grid/services/media-display-helpers'

import type { MediaTitlePageData, MediaTitleWatchEvent } from '../types'

const EMPTY_METADATA = '—'

const WATCH_EVENT_LABELS: Record<MediaTitleWatchEvent['eventType'], string> = {
  completed: 'Completed',
  dropped: 'Dropped',
  on_hold: 'On hold',
  progress: 'Progress',
  rewatched: 'Rewatched',
  started: 'Started',
}

export type MediaMetadataRow = {
  label: string
  value: string
}

export type TvWatchProgress = {
  episodeCount: null | number
  episodesWatched: number
  upNextEpisode: number
  upNextSeason: number
}

/**
 * Overview metadata pairs for a film or series.
 *
 * Films list director, genres, runtime, release date, and language. Series list
 * creators, genres, episode count, network, and TMDB status.
 *
 * @param data - Title page payload
 * @returns Label and value rows; missing values are an em dash
 */
export function buildMediaMetadataRows(data: MediaTitlePageData): MediaMetadataRow[] {
  const genres = (data.media.genres ?? [])
    .map((genre) => genre.name.trim())
    .filter(Boolean)
    .join(', ')

  if (data.media.mediaType === 'movie') {
    return [
      { label: 'Director', value: displayValue(data.directors.join(', ')) },
      { label: 'Genres', value: displayValue(genres) },
      { label: 'Runtime', value: displayValue(formatRuntime(data.media.runtime)) },
      { label: 'Released', value: displayValue(formatReleaseDateLabel(data.media.releaseDate)) },
      { label: 'Language', value: displayValue(data.language) },
    ]
  }

  const episodeCount = data.media.tvMeta?.episodeCount

  return [
    { label: 'Created by', value: displayValue(data.createdBy.join(', ')) },
    { label: 'Genres', value: displayValue(genres) },
    { label: 'Episodes', value: displayValue(episodeCount != null ? String(episodeCount) : null) },
    { label: 'Network', value: displayValue(data.networks.join(', ')) },
    { label: 'Status', value: displayValue(data.releaseStatusLabel) },
  ]
}

/**
 * Hero meta line: year, Film or Series, runtime or season count, and certification.
 *
 * @param input.certification - Regional rating, omitted when unknown
 * @param input.media - Catalog row supplying the year, type, runtime, and season count
 * @returns A middle-dot separated line, or an empty string when nothing is known
 */
export function formatMediaTitleMetaLine(input: {
  certification: null | string
  media: Media
}): string {
  const year = formatReleaseYear(input.media.releaseDate)
  const typeLabel = input.media.mediaType === 'movie' ? 'Film' : 'Series'
  const duration =
    input.media.mediaType === 'movie'
      ? formatRuntime(input.media.runtime)
      : formatSeasonCount(input.media.tvMeta?.seasonCount)

  return [year, typeLabel, duration, input.certification].filter(Boolean).join(' · ')
}

/**
 * Localized release date for the metadata grid.
 *
 * Year-only values stay as the year. Full dates render as `Jan 2, 2024`.
 *
 * @param value - ISO date or year from the catalog row
 * @returns A display date, or `null` when the value is empty or invalid
 */
export function formatReleaseDateLabel(value: null | string | undefined): null | string {
  if (!value) {
    return null
  }

  if (/^\d{4}$/.test(value)) {
    return value
  }

  const date = parseISO(value)

  if (!isValid(date)) {
    return formatReleaseYear(value)
  }

  return format(date, 'MMM d, yyyy')
}

/**
 * Short date for a watch event.
 *
 * @param watchedAt - ISO timestamp stored on the event
 * @returns `MMM d, yyyy`, or the original string when it cannot be parsed
 */
export function formatWatchActivityDate(watchedAt: string): string {
  const date = parseISO(watchedAt)

  if (!isValid(date)) {
    return watchedAt
  }

  return format(date, 'MMM d, yyyy')
}

/**
 * Primary line for one watch event on the activity tab.
 *
 * @param event - Watch event summary from the title payload
 * @returns The event label, plus `S1 E2` when the event names an episode
 */
export function formatWatchActivityLabel(event: MediaTitleWatchEvent): string {
  const episode =
    event.season != null && event.episode != null ? `S${event.season} E${event.episode}` : null

  return [WATCH_EVENT_LABELS[event.eventType], episode].filter(Boolean).join(' · ')
}

/**
 * Display name for the platform logged on a watch event.
 *
 * Known platforms use the shared registry label. `other` uses the custom name
 * when one was entered.
 *
 * @param event - Watch event summary from the title payload
 * @returns The platform label, or `null` when the event has no platform
 */
export function formatWatchActivityPlatform(event: MediaTitleWatchEvent): null | string {
  if (!event.platform) {
    return null
  }

  if (event.platform === 'other') {
    const custom = event.platformOther?.trim()

    return custom ? custom : 'Other'
  }

  return getStreamingPlatformMeta(event.platform).label
}

/**
 * Watching progress for the hero: episodes watched over the series total, and the next episode.
 *
 * Shown only while the library status is `watching`. Up next uses the same season-end
 * rules as the log-watch form, so finishing a season advances to the next season's first episode.
 *
 * @param input.episodeCount - Series episode count from catalog metadata
 * @param input.episodesWatched - Distinct episodes recorded on the library item
 * @param input.lastEpisode - Latest logged episode
 * @param input.lastSeason - Latest logged season
 * @param input.media - Catalog row used for season lengths and TMDB's next episode to air
 * @param input.seasonsCompleted - Seasons already marked complete on the library item
 * @param input.status - Library status; other statuses return `null`
 * @returns Counts and the next episode, or `null` when the bar should stay hidden
 */
export function getTvWatchProgress(input: {
  episodeCount?: null | number
  episodesWatched?: null | number
  lastEpisode?: null | number
  lastSeason?: null | number
  media?: null | Pick<Media, 'tvMeta'>
  seasonsCompleted?: null | number[]
  status?: null | string
}): null | TvWatchProgress {
  if (input.status !== 'watching') {
    return null
  }

  const next = suggestNextEpisode({
    libraryItem: {
      progress: {
        lastEpisode: input.lastEpisode,
        lastSeason: input.lastSeason,
        seasonsCompleted: input.seasonsCompleted,
        type: 'tv',
      },
    },
    media: input.media,
  })
  const episodeCount = input.episodeCount != null && input.episodeCount > 0 ? input.episodeCount : null

  return {
    episodeCount,
    episodesWatched: input.episodesWatched ?? 0,
    upNextEpisode: next.episode,
    upNextSeason: next.season,
  }
}

function displayValue(value: null | string | undefined): string {
  const trimmed = value?.trim()

  return trimmed ? trimmed : EMPTY_METADATA
}
