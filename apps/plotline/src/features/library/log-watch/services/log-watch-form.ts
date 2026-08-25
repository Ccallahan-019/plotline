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
  isRewatch: false,
  season: 1,
}

/**
 * Builds the log-watch form's initial values, including the next TV episode when known.
 *
 * For finished series the suggested episode is a rewatch of S1E1, and that flag is copied
 * onto the form-level `isRewatch` so single and batch submits stay consistent.
 *
 * @param options.libraryItem - Existing library item used to infer media type and progress
 * @param options.mediaType - Overrides the media type when the library item is missing
 * @param options.seasonEpisodeCount - Current season length, preferred over TMDB series totals
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
    isRewatch: nextEpisode?.isRewatch === true,
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
 * Completed non-final seasons advance to S(n+1)E1. Completing the final season returns S1E1
 * as a rewatch so submitting the default cannot reset progress as a first watch.
 *
 * @param libraryItem - Progress used to decide last season/episode and completed seasons
 * @param media - TV metadata for season count and TMDB next-episode fields
 * @param seasonEpisodeCount - Known length of the current season; wins over TMDB totals
 * @returns Season, episode, and whether the suggestion is a rewatch
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
          isRewatch: false,
          season: lastSeason + 1,
        }
      }

      return { ...FALLBACK_NEXT_EPISODE, isRewatch: true }
    } else {
      return {
        episode: lastEpisode + 1,
        isRewatch: false,
        season: lastSeason,
      }
    }
  }

  const nextEpisodeNumber = media?.tvMeta?.nextEpisodeNumber
  const nextEpisodeSeason = media?.tvMeta?.nextEpisodeSeason

  if (nextEpisodeSeason != null && nextEpisodeNumber != null) {
    return {
      episode: nextEpisodeNumber,
      isRewatch: false,
      season: nextEpisodeSeason,
    }
  }

  return { ...FALLBACK_NEXT_EPISODE }
}

/**
 * Library item to use after a successful log so the form can default the next TV episode.
 *
 * Movies overlay `progress.watched` and `rewatchCount` from the submitted values (count is
 * taken from the current item so a fresh API result is not incremented twice). TV
 * `lastSeason`/`lastEpisode` come from the chronologically latest submitted episode.
 * Populated media is kept from the current item so season-end suggestions can still use
 * `tvMeta`.
 *
 * @param options.currentLibraryItem - Form session item; used for populated `media`
 * @param options.mediaType - `movie` overlays watched/rewatch; `tv` overlays episode progress
 * @param options.resultLibraryItem - Mutation result; supplies updated status and ids
 * @param options.values - Submitted form values; movie rewatch and TV episode overlay source
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
      ...(values.isRewatch === true
        ? { rewatchCount: (currentLibraryItem.rewatchCount ?? 0) + 1 }
        : {}),
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
 * Each selected row keeps its own `isRewatch`; form-level rewatch is not applied to the
 * batch. Status transitions still use the TV planned → watching rule.
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
 * @param currentStatus - Existing library status, used to decide status transitions
 * @param mediaId - Library media id to attach the watch event to
 * @param mediaType - `movie` or `tv`; selects event type and TV context
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

  if (mediaType === 'movie') {
    const isRewatch = values.isRewatch === true

    return {
      eventType: isRewatch ? 'rewatched' : 'completed',
      mediaId,
      ...sharedFields,
      ...(isRewatch ? { isRewatch: true } : {}),
      ...(libraryItemStatus ? { libraryItemStatus } : {}),
      ...(runtimeMinutes != null ? { runtimeMinutes } : {}),
    }
  }

  const episode = resolveSingleTvEpisode(values)
  const isRewatch = episode?.isRewatch === true

  return {
    eventType: isRewatch ? 'rewatched' : 'progress',
    mediaId,
    ...sharedFields,
    ...(isRewatch ? { isRewatch: true } : {}),
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
 * Prefers `seasonsCompleted`, then an explicit season length, then TMDB only when the series
 * is known to be a single season. Series-wide `episodeCount` is not treated as season length.
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

  const resolvedSeasonEpisodeCount =
    seasonEpisodeCount ?? seasonEpisodeCountFromTvMeta(media?.tvMeta)

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

// Explicit per-episode flag wins; otherwise the form-level quick-log checkbox.
function resolveEpisodeRewatch(episode: LogWatchEpisodeInput, formIsRewatch: boolean): boolean {
  if (typeof episode.isRewatch === 'boolean') {
    return episode.isRewatch
  }

  return formIsRewatch
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

// First selected TV episode, with form-level and per-episode rewatch merged.
function resolveSingleTvEpisode(values: LogWatchFormValues): LogWatchEpisodeInput | undefined {
  const selectedEpisode = values.episodes[0] ?? values.episode

  if (selectedEpisode == null) {
    return undefined
  }

  return {
    episode: selectedEpisode.episode,
    isRewatch: resolveEpisodeRewatch(selectedEpisode, values.isRewatch),
    season: selectedEpisode.season,
  }
}

/**
 * Per-season episode count from TMDB, only when the series is a single season.
 *
 * Multi-season and unknown `seasonCount` return `undefined` because TMDB `episodeCount` is
 * series-wide, not the length of the current season.
 */
function seasonEpisodeCountFromTvMeta(tvMeta: Media['tvMeta'] | undefined): number | undefined {
  if (tvMeta?.episodeCount == null || tvMeta.seasonCount !== 1) {
    return undefined
  }

  return tvMeta.episodeCount
}

// Batch episode row; includes `isRewatch` only when that row is marked a rewatch.
function toBatchEpisode(episode: LogWatchEpisodeInput): LogWatchBatchInput['episodes'][number] {
  return {
    episode: episode.episode,
    season: episode.season,
    ...(episode.isRewatch === true ? { isRewatch: true } : {}),
  }
}
