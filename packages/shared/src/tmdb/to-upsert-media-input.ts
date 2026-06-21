import type { MediaReleaseStatus, MediaType } from '../constants/media'
import type { TmdbMovieDetails, TmdbTvDetails } from './schemas'

export type TmdbUpsertMediaInput = {
  backdropPath?: null | string
  externalIds?: {
    imdbId?: null | string
    tvdbId?: null | number
  }
  genres?: Array<{ id: number; name: string }>
  mediaType: MediaType
  metadataSyncedAt?: null | string
  originalTitle?: null | string
  overview?: null | string
  popularity?: null | number
  posterPath?: null | string
  releaseDate?: null | string
  runtime?: null | number
  status?: MediaReleaseStatus | null
  tagline?: null | string
  title: string
  tmdbId: number
  tvMeta?: {
    episodeCount?: null | number
    inProduction?: boolean | null
    nextEpisodeDate?: null | string
    nextEpisodeNumber?: null | number
    nextEpisodeSeason?: null | number
    seasonCount?: null | number
  }
  voteAverage?: null | number
}

export function averageEpisodeRunTime(episodeRunTime: number[] | undefined): null | number {
  if (!episodeRunTime?.length) {
    return null
  }

  const total = episodeRunTime.reduce((sum, minutes) => sum + minutes, 0)

  return Math.round(total / episodeRunTime.length)
}

export function mapMovieDetailsToUpsertInput(details: TmdbMovieDetails): TmdbUpsertMediaInput {
  return {
    backdropPath: details.backdrop_path ?? null,
    externalIds: details.imdb_id ? { imdbId: details.imdb_id } : undefined,
    genres: details.genres,
    mediaType: 'movie',
    originalTitle: details.original_title ?? null,
    overview: details.overview ?? null,
    popularity: details.popularity ?? null,
    posterPath: details.poster_path ?? null,
    releaseDate: details.release_date ?? null,
    runtime: details.runtime ?? null,
    status: mapTmdbReleaseStatus(details.status),
    tagline: details.tagline ?? null,
    title: details.title,
    tmdbId: details.id,
    voteAverage: details.vote_average ?? null,
  }
}

export function mapTmdbReleaseStatus(
  tmdbStatus: string | undefined,
  options?: { inProduction?: boolean },
): MediaReleaseStatus | null {
  if (tmdbStatus) {
    const normalized = tmdbStatus.toLowerCase()

    if (normalized.includes('cancel')) {
      return 'cancelled'
    }

    if (
      normalized === 'released' ||
      normalized === 'ended' ||
      normalized.includes('returning series')
    ) {
      return 'released'
    }

    if (normalized.includes('production')) {
      return 'in_production'
    }

    if (
      normalized === 'rumored' ||
      normalized === 'planned' ||
      normalized.includes('development') ||
      normalized === 'pilot'
    ) {
      return 'upcoming'
    }
  }

  if (options?.inProduction) {
    return 'in_production'
  }

  return null
}

export function mapTvDetailsToUpsertInput(details: TmdbTvDetails): TmdbUpsertMediaInput {
  const nextEpisode = details.next_episode_to_air

  return {
    backdropPath: details.backdrop_path ?? null,
    externalIds:
      details.external_ids?.imdb_id || details.external_ids?.tvdb_id
        ? {
            imdbId: details.external_ids.imdb_id ?? null,
            tvdbId: details.external_ids.tvdb_id ?? null,
          }
        : undefined,
    genres: details.genres,
    mediaType: 'tv',
    originalTitle: details.original_name ?? null,
    overview: details.overview ?? null,
    popularity: details.popularity ?? null,
    posterPath: details.poster_path ?? null,
    releaseDate: details.first_air_date ?? null,
    runtime: averageEpisodeRunTime(details.episode_run_time),
    status: mapTmdbReleaseStatus(details.status, { inProduction: details.in_production }),
    title: details.name,
    tmdbId: details.id,
    tvMeta: {
      episodeCount: details.number_of_episodes ?? null,
      inProduction: details.in_production ?? null,
      nextEpisodeDate: nextEpisode?.air_date ?? null,
      nextEpisodeNumber: nextEpisode?.episode_number ?? null,
      nextEpisodeSeason: nextEpisode?.season_number ?? null,
      seasonCount: details.number_of_seasons ?? null,
    },
    voteAverage: details.vote_average ?? null,
  }
}
