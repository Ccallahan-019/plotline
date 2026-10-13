import type { MediaType } from '../constants/media'

import {
  type TmdbGenreList,
  tmdbGenreListSchema,
  type TmdbMovieDetails,
  tmdbMovieDetailsSchema,
  type TmdbMovieTitleDetails,
  tmdbMovieTitleDetailsSchema,
  type TmdbReviewsResponse,
  tmdbReviewsResponseSchema,
  type TmdbSearchResponse,
  tmdbSearchResponseSchema,
  type TmdbTitleWatchProviders,
  tmdbTitleWatchProvidersSchema,
  type TmdbTvDetails,
  tmdbTvDetailsSchema,
  type TmdbTvSeasonDetails,
  tmdbTvSeasonDetailsSchema,
  type TmdbTvTitleDetails,
  tmdbTvTitleDetailsSchema,
  type TmdbWatchProviderList,
  tmdbWatchProviderListSchema,
} from './schemas'

const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const DEFAULT_TIMEOUT_MS = 10_000

export type TmdbClientOptions = {
  accessToken: string
  baseUrl?: string
  /** Per-request limit before the call is aborted. Defaults to 10 seconds. */
  timeoutMs?: number
}

export class TmdbClient {
  private readonly accessToken: string
  private readonly baseUrl: string
  private readonly timeoutMs: number

  constructor(options: TmdbClientOptions) {
    this.accessToken = normalizeAccessToken(options.accessToken)
    this.baseUrl = options.baseUrl ?? TMDB_BASE_URL
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS
  }

  async discoverMovie(page = 1, params: Record<string, string> = {}): Promise<TmdbSearchResponse> {
    return this.fetchValidated('/discover/movie', tmdbSearchResponseSchema, {
      page: String(page),
      sort_by: 'popularity.desc',
      ...params,
    })
  }

  async discoverTv(page = 1, params: Record<string, string> = {}): Promise<TmdbSearchResponse> {
    return this.fetchValidated('/discover/tv', tmdbSearchResponseSchema, {
      page: String(page),
      sort_by: 'popularity.desc',
      ...params,
    })
  }

  async getMovieDetails(id: number): Promise<TmdbMovieDetails> {
    return this.fetchValidated(`/movie/${id}`, tmdbMovieDetailsSchema, {
      append_to_response: 'external_ids',
    })
  }

  async getMovieGenreList(): Promise<TmdbGenreList> {
    return this.fetchValidated('/genre/movie/list', tmdbGenreListSchema)
  }

  async getMovieReviews(id: number, page = 1): Promise<TmdbReviewsResponse> {
    return this.fetchValidated(`/movie/${id}/reviews`, tmdbReviewsResponseSchema, {
      page: String(page),
    })
  }

  async getMovieTitleDetails(id: number): Promise<TmdbMovieTitleDetails> {
    return this.fetchValidated(`/movie/${id}`, tmdbMovieTitleDetailsSchema, {
      append_to_response: 'credits,external_ids,release_dates',
    })
  }

  async getMovieTitleWatchProviders(id: number): Promise<TmdbTitleWatchProviders> {
    return this.fetchValidated(`/movie/${id}/watch/providers`, tmdbTitleWatchProvidersSchema)
  }

  async getMovieWatchProviders(watchRegion: string): Promise<TmdbWatchProviderList> {
    return this.fetchValidated('/watch/providers/movie', tmdbWatchProviderListSchema, {
      watch_region: watchRegion,
    })
  }

  /**
   * Loads page 1 of TMDB's recommendations for a title.
   *
   * @param mediaType - `movie` or `tv`
   * @param id - TMDB title id
   * @returns Results without `media_type`; callers stamp it from `mediaType`
   */
  async getRecommendations(mediaType: MediaType, id: number): Promise<TmdbSearchResponse> {
    return this.fetchValidated(`/${mediaType}/${id}/recommendations`, tmdbSearchResponseSchema, {
      page: '1',
    })
  }

  /**
   * Loads page 1 of TMDB's similar titles for a title.
   *
   * @param mediaType - `movie` or `tv`
   * @param id - TMDB title id
   * @returns Results without `media_type`; callers stamp it from `mediaType`
   */
  async getSimilar(mediaType: MediaType, id: number): Promise<TmdbSearchResponse> {
    return this.fetchValidated(`/${mediaType}/${id}/similar`, tmdbSearchResponseSchema, {
      page: '1',
    })
  }

  async getTvDetails(id: number): Promise<TmdbTvDetails> {
    return this.fetchValidated(`/tv/${id}`, tmdbTvDetailsSchema, {
      append_to_response: 'external_ids',
    })
  }

  async getTvGenreList(): Promise<TmdbGenreList> {
    return this.fetchValidated('/genre/tv/list', tmdbGenreListSchema)
  }

  async getTvReviews(id: number, page = 1): Promise<TmdbReviewsResponse> {
    return this.fetchValidated(`/tv/${id}/reviews`, tmdbReviewsResponseSchema, {
      page: String(page),
    })
  }

  async getTvSeasonDetails(tvId: number, seasonNumber: number): Promise<TmdbTvSeasonDetails> {
    return this.fetchValidated(`/tv/${tvId}/season/${seasonNumber}`, tmdbTvSeasonDetailsSchema)
  }

  async getTvTitleDetails(id: number): Promise<TmdbTvTitleDetails> {
    return this.fetchValidated(`/tv/${id}`, tmdbTvTitleDetailsSchema, {
      append_to_response: 'aggregate_credits,content_ratings,external_ids',
    })
  }

  async getTvTitleWatchProviders(id: number): Promise<TmdbTitleWatchProviders> {
    return this.fetchValidated(`/tv/${id}/watch/providers`, tmdbTitleWatchProvidersSchema)
  }

  async getTvWatchProviders(watchRegion: string): Promise<TmdbWatchProviderList> {
    return this.fetchValidated('/watch/providers/tv', tmdbWatchProviderListSchema, {
      watch_region: watchRegion,
    })
  }

  async searchMovies(query: string, page = 1): Promise<TmdbSearchResponse> {
    return this.fetchValidated('/search/movie', tmdbSearchResponseSchema, {
      page: String(page),
      query,
    })
  }

  async searchMulti(query: string, page = 1): Promise<TmdbSearchResponse> {
    return this.fetchValidated('/search/multi', tmdbSearchResponseSchema, {
      page: String(page),
      query,
    })
  }

  async searchTv(query: string, page = 1): Promise<TmdbSearchResponse> {
    return this.fetchValidated('/search/tv', tmdbSearchResponseSchema, {
      page: String(page),
      query,
    })
  }

  private async fetch(path: string, params: Record<string, string> = {}): Promise<unknown> {
    const url = new URL(`${this.baseUrl}${path}`)

    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value)
    }

    const response = await fetch(url, {
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
      },
      signal: AbortSignal.timeout(this.timeoutMs),
    })

    if (!response.ok) {
      throw new TmdbError(`TMDB request failed: ${response.statusText}`, response.status, path)
    }

    return response.json()
  }

  private async fetchValidated<T>(
    path: string,
    schema: { parse: (data: unknown) => T },
    params: Record<string, string> = {},
  ): Promise<T> {
    const data: unknown = await this.fetch(path, params)
    return schema.parse(data)
  }
}

export class TmdbError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly path: string,
  ) {
    super(message)
    this.name = 'TmdbError'
  }
}

export function createTmdbClient(accessToken: string): TmdbClient {
  return new TmdbClient({ accessToken })
}

function normalizeAccessToken(token: string): string {
  return token.replace(/^Bearer\s+/i, '').trim()
}
