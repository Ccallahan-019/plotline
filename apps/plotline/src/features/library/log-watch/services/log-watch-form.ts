import type { LibraryItem, Media } from '@plotline/payload-types'
import type { MediaStatus, MediaType } from '@plotline/shared/constants'

import { isSameDay, startOfDay, subDays } from 'date-fns'

import type { LogWatchBatchInput, LogWatchInput } from '@/features/library/types/mutations'

import type {
  LogWatchEpisodeInput,
  LogWatchFormValues,
  LogWatchWhenPreset,
} from './log-watch-form-schema'

import { getMediaFromLibraryItem } from '../../services/get-media-from-library-item'

type GetDefaultLogWatchFormValuesOptions = {
  libraryItem?: LibraryItem
  mediaType?: MediaType
  seasonEpisodeCount?: number
}

type ResolveLogWatchLibraryItemStatusOptions = {
  currentStatus?: MediaStatus
  mediaType: MediaType
}

type SuggestNextEpisodeOptions = {
  libraryItem?: Pick<LibraryItem, 'progress'>
  media?: null | Pick<Media, 'tvMeta'>
  seasonEpisodeCount?: number
}

type ToLibraryItemAfterLogWatchOptions = {
  currentLibraryItem: LibraryItem
  mediaType: MediaType
  resultLibraryItem: LibraryItem
  values: LogWatchFormValues
}

type ToLogWatchBatchInputOptions = {
  currentStatus?: MediaStatus
  mediaId: number | string
  values: LogWatchFormValues
}

type ToLogWatchInputOptions = {
  currentStatus?: MediaStatus
  mediaId: number | string
  mediaType: MediaType
  runtimeMinutes?: number
  values: LogWatchFormValues
}

const FALLBACK_NEXT_EPISODE: LogWatchEpisodeInput = {
  episode: 1,
  season: 1,
}

/**
 * Builds the log-watch form's initial values, including the next TV episode when known.
 *
 * Finished series still default to S1E1. The server decides whether that submit is a rewatch.
 *
 * @param options.libraryItem - Existing library item used to infer media type and progress
 * @param options.mediaType - Overrides the media type when the library item is missing
 * @param options.seasonEpisodeCount - Length of the season in progress; wins over stored totals
 * @returns Today-dated form values with an optional next-episode suggestion
 */
export function getDefaultLogWatchFormValues(
  options?: GetDefaultLogWatchFormValuesOptions,
): LogWatchFormValues {
  const media = options?.libraryItem ? getMediaFromLibraryItem(options.libraryItem) : null
  const mediaType = options?.mediaType ?? media?.mediaType ?? options?.libraryItem?.progress.type
  const nextEpisode =
    mediaType === 'tv'
      ? suggestNextEpisode({
          libraryItem: options?.libraryItem,
          media,
          seasonEpisodeCount: options?.seasonEpisodeCount,
        })
      : undefined

  return {
    episode: nextEpisode,
    episodes: nextEpisode ? [{ ...nextEpisode }] : [],
    platform: undefined,
    platformOther: '',
    watchedAt: startOfDay(new Date()),
    whenPreset: 'today',
  }
}

/**
 * Status to persist with the watch event, if any.
 *
 * Movies become `completed` on first log. TV moves `planned` → `watching`. Already-complete
 * movies and in-progress TV return `undefined` so the library item is left unchanged.
 *
 * @param currentStatus - Current library item status
 * @param mediaType - `movie` or `tv`; selects which transition applies
 * @returns The next status, or `undefined` when no transition should run
 */
export function resolveLogWatchLibraryItemStatus({
  currentStatus,
  mediaType,
}: ResolveLogWatchLibraryItemStatusOptions): MediaStatus | undefined {
  if (mediaType === 'movie') {
    return currentStatus === 'completed' ? undefined : 'completed'
  }

  return currentStatus === 'planned' ? 'watching' : undefined
}

// True when the form should submit as a multi-episode batch.
export function shouldSubmitLogWatchBatch(values: LogWatchFormValues): boolean {
  return values.episodes.length > 1
}

/**
 * Suggests the next episode to log from library progress, then TMDB "next episode".
 *
 * Completed non-final seasons advance to S(n+1)E1. Completing the final season returns
 * S1E1. The server classifies that submit when the show is already covered.
 *
 * Season-end detection uses `progress.seasonsCompleted`, then an explicit season length,
 * then `tvMeta.seasonEpisodeCounts`. Series-wide `episodeCount` is used only for a
 * one-season show.
 *
 * @param libraryItem - Progress used to decide last season/episode and completed seasons
 * @param media - TV metadata for season lengths and TMDB next-episode fields
 * @param seasonEpisodeCount - Known length of the season in progress; wins over stored totals
 * @returns The season and episode to prefill
 */
export function suggestNextEpisode({
  libraryItem,
  media,
  seasonEpisodeCount,
}: SuggestNextEpisodeOptions = {}): LogWatchEpisodeInput {
  const lastEpisode = libraryItem?.progress.lastEpisode
  const lastSeason = libraryItem?.progress.lastSeason

  if (lastSeason != null && lastEpisode != null) {
    if (
      hasCompletedCurrentSeason({
        lastEpisode,
        lastSeason,
        libraryItem,
        media,
        seasonEpisodeCount,
      })
    ) {
      const seasonCount = media?.tvMeta?.seasonCount

      if (seasonCount == null || lastSeason < seasonCount) {
        return {
          episode: 1,
          season: lastSeason + 1,
        }
      }

      return { ...FALLBACK_NEXT_EPISODE }
    }

    return {
      episode: lastEpisode + 1,
      season: lastSeason,
    }
  }

  const nextEpisodeNumber = media?.tvMeta?.nextEpisodeNumber
  const nextEpisodeSeason = media?.tvMeta?.nextEpisodeSeason

  if (nextEpisodeSeason != null && nextEpisodeNumber != null) {
    return {
      episode: nextEpisodeNumber,
      season: nextEpisodeSeason,
    }
  }

  return { ...FALLBACK_NEXT_EPISODE }
}

/**
 * Library item to use after a successful log so the form can default the next TV episode.
 *
 * Movies keep `rewatchCount` from the mutation result and mark `progress.watched`. TV
 * `lastSeason`/`lastEpisode` come from the chronologically latest submitted episode.
 * Populated media is kept from the current item so season-end suggestions can still use
 * `tvMeta`.
 *
 * @param options.currentLibraryItem - Form session item; used for populated `media`
 * @param options.mediaType - `movie` overlays watched progress; `tv` overlays episode progress
 * @param options.resultLibraryItem - Mutation result; supplies status, ids, and movie rewatch count
 * @param options.values - Submitted form values; TV episode overlay source
 * @returns A library item whose progress matches the watch that was just logged
 */
export function toLibraryItemAfterLogWatch({
  currentLibraryItem,
  mediaType,
  resultLibraryItem,
  values,
}: ToLibraryItemAfterLogWatchOptions): LibraryItem {
  const media =
    typeof currentLibraryItem.media === 'object'
      ? currentLibraryItem.media
      : resultLibraryItem.media
  const submittedEpisode = resolveLatestSubmittedEpisode(values)

  if (mediaType === 'movie') {
    return {
      ...resultLibraryItem,
      media,
      progress: {
        ...resultLibraryItem.progress,
        type: 'movie',
        watched: true,
      },
    }
  }

  if (submittedEpisode == null) {
    return {
      ...resultLibraryItem,
      media,
    }
  }

  return {
    ...resultLibraryItem,
    media,
    progress: {
      ...resultLibraryItem.progress,
      lastEpisode: submittedEpisode.episode,
      lastSeason: submittedEpisode.season,
      type: 'tv',
    },
  }
}

/**
 * Maps log-watch form values to a multi-episode mutation payload.
 *
 * Each row is a season and episode only. The server classifies rewatches. Status
 * transitions still use the TV planned → watching rule.
 *
 * @param currentStatus - Existing library status, used to decide status transitions
 * @param mediaId - Library media id to attach the watch events to
 * @param values - Submitted form values
 * @returns A `LogWatchBatchInput` ready for the batch log-watch API
 */
export function toLogWatchBatchInput({
  currentStatus,
  mediaId,
  values,
}: ToLogWatchBatchInputOptions): LogWatchBatchInput {
  const libraryItemStatus = resolveLogWatchLibraryItemStatus({
    currentStatus,
    mediaType: 'tv',
  })

  return {
    episodes: values.episodes.map(toBatchEpisode),
    mediaId,
    ...mapSharedWatchFields(values),
    ...(libraryItemStatus ? { libraryItemStatus } : {}),
  }
}

/**
 * Maps log-watch form values to a single mutation payload.
 *
 * The server assigns `completed`, `progress`, or `rewatched`. This payload carries the
 * season and episode for TV and does not send an event type.
 *
 * @param currentStatus - Existing library status, used to decide status transitions
 * @param mediaId - Library media id to attach the watch event to
 * @param mediaType - `movie` or `tv`; selects the status transition and TV context
 * @param runtimeMinutes - Optional runtime copied onto the payload when present
 * @param values - Submitted form values
 * @returns A `LogWatchInput` ready for the log-watch API
 */
export function toLogWatchInput({
  currentStatus,
  mediaId,
  mediaType,
  runtimeMinutes,
  values,
}: ToLogWatchInputOptions): LogWatchInput {
  const libraryItemStatus = resolveLogWatchLibraryItemStatus({
    currentStatus,
    mediaType,
  })
  const sharedFields = mapSharedWatchFields(values)
  const episode = mediaType === 'tv' ? resolveSingleTvEpisode(values) : undefined

  return {
    mediaId,
    ...sharedFields,
    ...(libraryItemStatus ? { libraryItemStatus } : {}),
    ...(runtimeMinutes != null ? { runtimeMinutes } : {}),
    ...(episode
      ? {
          tvContext: {
            episode: episode.episode,
            season: episode.season,
          },
        }
      : {}),
  }
}

// Start-of-day date for the today/yesterday presets.
export function watchedAtForWhenPreset(
  preset: Exclude<LogWatchWhenPreset, 'custom'>,
  now = new Date(),
): Date {
  return startOfDay(preset === 'yesterday' ? subDays(now, 1) : now)
}

// Inverse of `watchedAtForWhenPreset`: today, yesterday, or custom.
export function whenPresetForWatchedAt(watchedAt: Date, now = new Date()): LogWatchWhenPreset {
  if (isSameDay(watchedAt, now)) {
    return 'today'
  }

  if (isSameDay(watchedAt, subDays(now, 1))) {
    return 'yesterday'
  }

  return 'custom'
}

/**
 * Whether last watched progress sits at (or past) the end of that season.
 *
 * Prefers `seasonsCompleted`, then an explicit season length, then stored per-season
 * counts. Series-wide `episodeCount` is not treated as season length except for a
 * one-season show.
 *
 * @returns True when the current season should be considered finished
 */
function hasCompletedCurrentSeason({
  lastEpisode,
  lastSeason,
  libraryItem,
  media,
  seasonEpisodeCount,
}: {
  lastEpisode: number
  lastSeason: number
  libraryItem?: Pick<LibraryItem, 'progress'>
  media?: null | Pick<Media, 'tvMeta'>
  seasonEpisodeCount?: number
}): boolean {
  if (libraryItem?.progress.seasonsCompleted?.includes(lastSeason)) {
    return true
  }

  const resolvedSeasonEpisodeCount = resolveSeasonEpisodeCount({
    season: lastSeason,
    seasonEpisodeCount,
    tvMeta: media?.tvMeta,
  })

  return resolvedSeasonEpisodeCount != null && lastEpisode >= resolvedSeasonEpisodeCount
}

// Platform and watched-at fields shared by single and batch payloads.
function mapSharedWatchFields(
  values: LogWatchFormValues,
): Pick<LogWatchInput, 'platform' | 'platformOther' | 'watchedAt'> {
  const platformOther =
    values.platform === 'other' ? values.platformOther.trim() || undefined : undefined

  return {
    ...(values.platform ? { platform: values.platform } : {}),
    ...(platformOther ? { platformOther } : {}),
    watchedAt: values.watchedAt.toISOString(),
  }
}

// Chronologically latest TV episode from the dialog selection, else the quick-log episode.
function resolveLatestSubmittedEpisode(
  values: LogWatchFormValues,
): LogWatchEpisodeInput | undefined {
  const submitted =
    values.episodes.length > 0
      ? [...values.episodes]
      : values.episode != null
        ? [values.episode]
        : []

  if (submitted.length === 0) {
    return undefined
  }

  submitted.sort((left, right) => {
    if (left.season !== right.season) {
      return left.season - right.season
    }

    return left.episode - right.episode
  })

  return submitted.at(-1)
}

/**
 * Episode length used to decide whether `season` is finished.
 *
 * An explicit length wins, then `tvMeta.seasonEpisodeCounts` for that season. Series-wide
 * `episodeCount` applies only when the show has a single season and `season` is 1.
 * Missing or non-positive lengths are omitted so the caller does not guess.
 *
 * @param season - Season whose length is needed
 * @param seasonEpisodeCount - Caller-supplied length for that season
 * @param tvMeta - Stored TV metadata, including per-season counts
 * @returns A positive episode count, or `undefined` when the length is unknown
 */
function resolveSeasonEpisodeCount({
  season,
  seasonEpisodeCount,
  tvMeta,
}: {
  season: number
  seasonEpisodeCount?: number
  tvMeta: Media['tvMeta'] | undefined
}): number | undefined {
  if (seasonEpisodeCount != null && seasonEpisodeCount > 0) {
    return seasonEpisodeCount
  }

  const storedCount = tvMeta?.seasonEpisodeCounts?.find((entry) => entry.season === season)

  if (storedCount != null && storedCount.episodeCount > 0) {
    return storedCount.episodeCount
  }

  if (
    tvMeta?.seasonCount === 1 &&
    season === 1 &&
    tvMeta.episodeCount != null &&
    tvMeta.episodeCount > 0
  ) {
    return tvMeta.episodeCount
  }

  return undefined
}

// First selected TV episode, preferring the dialog list over the quick-log field.
function resolveSingleTvEpisode(values: LogWatchFormValues): LogWatchEpisodeInput | undefined {
  return values.episodes[0] ?? values.episode
}

// Batch episode row: season and episode only. The server classifies rewatches.
function toBatchEpisode(episode: LogWatchEpisodeInput): LogWatchBatchInput['episodes'][number] {
  return {
    episode: episode.episode,
    season: episode.season,
  }
}
