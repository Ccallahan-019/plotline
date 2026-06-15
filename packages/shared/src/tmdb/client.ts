import {
  type TmdbMovieDetails,
  tmdbMovieDetailsSchema,
  type TmdbSearchResponse,
  tmdbSearchResponseSchema,
  type TmdbTvDetails,
  tmdbTvDetailsSchema,
} from "./schemas";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export type TmdbClientOptions = {
  apiKey: string;
  baseUrl?: string;
};

export class TmdbClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(options: TmdbClientOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl ?? TMDB_BASE_URL;
  }

  async getMovieDetails(id: number): Promise<TmdbMovieDetails> {
    return this.fetchValidated(`/movie/${id}`, tmdbMovieDetailsSchema, {
      append_to_response: "external_ids",
    });
  }

  async getTvDetails(id: number): Promise<TmdbTvDetails> {
    return this.fetchValidated(`/tv/${id}`, tmdbTvDetailsSchema, {
      append_to_response: "external_ids",
    });
  }

  async searchMovies(
    query: string,
    page = 1,
  ): Promise<TmdbSearchResponse> {
    return this.fetchValidated(
      "/search/movie",
      tmdbSearchResponseSchema,
      { page: String(page), query },
    );
  }

  async searchMulti(query: string, page = 1): Promise<TmdbSearchResponse> {
    return this.fetchValidated(
      "/search/multi",
      tmdbSearchResponseSchema,
      { page: String(page), query },
    );
  }

  async searchTv(query: string, page = 1): Promise<TmdbSearchResponse> {
    return this.fetchValidated(
      "/search/tv",
      tmdbSearchResponseSchema,
      { page: String(page), query },
    );
  }

  private async fetch(
    path: string,
    params: Record<string, string> = {},
  ): Promise<unknown> {
    const url = new URL(`${this.baseUrl}${path}`);
    url.searchParams.set("api_key", this.apiKey);

    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new TmdbError(
        `TMDB request failed: ${response.statusText}`,
        response.status,
        path,
      );
    }

    return response.json();
  }

  private async fetchValidated<T>(
    path: string,
    schema: { parse: (data: unknown) => T },
    params: Record<string, string> = {},
  ): Promise<T> {
    const data: unknown = await this.fetch(path, params);
    return schema.parse(data);
  }
}

export class TmdbError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly path: string,
  ) {
    super(message);
    this.name = "TmdbError";
  }
}

export function createTmdbClient(apiKey: string): TmdbClient {
  return new TmdbClient({ apiKey });
}
