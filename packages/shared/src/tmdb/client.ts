import {
  type TmdbGenreList,
  tmdbGenreListSchema,
  type TmdbMovieDetails,
  tmdbMovieDetailsSchema,
  type TmdbSearchResponse,
  tmdbSearchResponseSchema,
  type TmdbTvDetails,
  tmdbTvDetailsSchema,
  type TmdbWatchProviderList,
  tmdbWatchProviderListSchema,
} from './schemas'

const TMDB_BASE_URL = 'https://api.themoviedb.org/3'

export type TmdbClientOptions = {
  accessToken: string
  baseUrl?: string
}

export class TmdbClient {
  private readonly accessToken: string
  private readonly baseUrl: string

  constructor(options: TmdbClientOptions) {
    this.accessToken = normalizeAccessToken(options.accessToken)
    this.baseUrl = options.baseUrl ?? TMDB_BASE_URL
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

  async getMovieWatchProviders(watchRegion: string): Promise<TmdbWatchProviderList> {
    return this.fetchValidated('/watch/providers/movie', tmdbWatchProviderListSchema, {
      watch_region: watchRegion,
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
