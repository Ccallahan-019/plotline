import { z } from 'zod'

const genreSchema = z.object({
  id: z.number(),
  name: z.string(),
})

const searchResultItemSchema = z.object({
  backdrop_path: z.string().nullable().optional(),
  first_air_date: z.string().optional(),
  id: z.number(),
  media_type: z.enum(['movie', 'tv']).optional(),
  name: z.string().optional(),
  number_of_episodes: z.number().optional(),
  original_name: z.string().optional(),
  original_title: z.string().optional(),
  overview: z.string().nullable().optional(),
  popularity: z.number().optional(),
  poster_path: z.string().nullable().optional(),
  release_date: z.string().optional(),
  runtime: z.number().optional(),
  title: z.string().optional(),
  vote_average: z.number().optional(),
})

export const tmdbSearchResponseSchema = z.object({
  page: z.number(),
  results: z.array(searchResultItemSchema),
  total_pages: z.number(),
  total_results: z.number(),
})

export type TmdbSearchResponse = z.infer<typeof tmdbSearchResponseSchema>
export type TmdbSearchResultItem = z.infer<typeof searchResultItemSchema>

const movieDetailsSchema = z.object({
  backdrop_path: z.string().nullable().optional(),
  genres: z.array(genreSchema).optional(),
  id: z.number(),
  imdb_id: z.string().nullable().optional(),
  original_title: z.string().optional(),
  overview: z.string().nullable().optional(),
  popularity: z.number().optional(),
  poster_path: z.string().nullable().optional(),
  release_date: z.string().optional(),
  runtime: z.number().nullable().optional(),
  status: z.string().optional(),
  tagline: z.string().nullable().optional(),
  title: z.string(),
  vote_average: z.number().optional(),
})

export const tmdbMovieDetailsSchema = movieDetailsSchema

export type TmdbMovieDetails = z.infer<typeof tmdbMovieDetailsSchema>

const tvDetailsSchema = z.object({
  backdrop_path: z.string().nullable().optional(),
  episode_run_time: z.array(z.number()).optional(),
  external_ids: z
    .object({
      imdb_id: z.string().nullable().optional(),
      tvdb_id: z.number().nullable().optional(),
    })
    .optional(),
  first_air_date: z.string().optional(),
  genres: z.array(genreSchema).optional(),
  id: z.number(),
  in_production: z.boolean().optional(),
  name: z.string(),
  next_episode_to_air: z
    .object({
      air_date: z.string().nullable().optional(),
      episode_number: z.number().optional(),
      season_number: z.number().optional(),
    })
    .nullable()
    .optional(),
  number_of_episodes: z.number().optional(),
  number_of_seasons: z.number().optional(),
  original_name: z.string().optional(),
  overview: z.string().nullable().optional(),
  popularity: z.number().optional(),
  poster_path: z.string().nullable().optional(),
  seasons: z
    .array(
      z.object({
        episode_count: z.number().nullable().optional(),
        season_number: z.number().nullable().optional(),
      }),
    )
    .optional(),
  status: z.string().optional(),
  vote_average: z.number().optional(),
})

export const tmdbTvDetailsSchema = tvDetailsSchema

export type TmdbTvDetails = z.infer<typeof tmdbTvDetailsSchema>

const tvSeasonEpisodeSchema = z.object({
  air_date: z.string().nullable().optional(),
  episode_number: z.number(),
  name: z.string().nullable(),
  runtime: z.number().nullable().optional(),
})

export const tmdbTvSeasonDetailsSchema = z.object({
  episodes: z.array(tvSeasonEpisodeSchema),
  season_number: z.number(),
})

export type TmdbTvSeasonDetails = z.infer<typeof tmdbTvSeasonDetailsSchema>
export type TmdbTvSeasonEpisode = z.infer<typeof tvSeasonEpisodeSchema>

export const tmdbGenreListSchema = z.object({
  genres: z.array(genreSchema),
})

export type TmdbGenre = z.infer<typeof genreSchema>
export type TmdbGenreList = z.infer<typeof tmdbGenreListSchema>

const watchProviderSchema = z.object({
  display_priority: z.number().optional(),
  logo_path: z.string().nullable().optional(),
  provider_id: z.number(),
  provider_name: z.string(),
})

export const tmdbWatchProviderListSchema = z.object({
  results: z.array(watchProviderSchema),
})

export type TmdbWatchProvider = z.infer<typeof watchProviderSchema>
export type TmdbWatchProviderList = z.infer<typeof tmdbWatchProviderListSchema>

// Unknown keys are stripped so a new TMDB offer field does not fail the request.
const tmdbTitleWatchProviderCountrySchema = z.object({
  ads: z.array(watchProviderSchema).optional(),
  buy: z.array(watchProviderSchema).optional(),
  flatrate: z.array(watchProviderSchema).optional(),
  free: z.array(watchProviderSchema).optional(),
  link: z.string().nullable().optional(),
  rent: z.array(watchProviderSchema).optional(),
})

export const tmdbTitleWatchProvidersSchema = z.object({
  id: z.number(),
  results: z.record(z.string(), tmdbTitleWatchProviderCountrySchema),
})

export type TmdbTitleWatchProviderCountry = z.infer<typeof tmdbTitleWatchProviderCountrySchema>
export type TmdbTitleWatchProviders = z.infer<typeof tmdbTitleWatchProvidersSchema>

const tmdbCastMemberSchema = z.object({
  character: z.string().nullable().optional(),
  id: z.number(),
  name: z.string(),
  profile_path: z.string().nullable().optional(),
})

const tmdbCrewMemberSchema = z.object({
  id: z.number(),
  job: z.string().optional(),
  name: z.string(),
  profile_path: z.string().nullable().optional(),
})

const tmdbCreditsSchema = z.object({
  cast: z.array(tmdbCastMemberSchema).optional(),
  crew: z.array(tmdbCrewMemberSchema).optional(),
})

const tmdbAggregateCastMemberSchema = z.object({
  id: z.number(),
  name: z.string(),
  order: z.number().optional(),
  profile_path: z.string().nullable().optional(),
  roles: z
    .array(
      z.object({
        character: z.string().nullable().optional(),
      }),
    )
    .optional(),
})

const tmdbAggregateCrewMemberSchema = z.object({
  id: z.number(),
  jobs: z
    .array(
      z.object({
        job: z.string().optional(),
      }),
    )
    .optional(),
  name: z.string(),
  profile_path: z.string().nullable().optional(),
})

const tmdbAggregateCreditsSchema = z.object({
  cast: z.array(tmdbAggregateCastMemberSchema).optional(),
  crew: z.array(tmdbAggregateCrewMemberSchema).optional(),
})

const tmdbReleaseDatesSchema = z.object({
  results: z.array(
    z.object({
      iso_3166_1: z.string(),
      release_dates: z.array(
        z.object({
          certification: z.string().optional(),
          type: z.number().optional(),
        }),
      ),
    }),
  ),
})

const tmdbContentRatingsSchema = z.object({
  results: z.array(
    z.object({
      iso_3166_1: z.string(),
      rating: z.string().optional(),
    }),
  ),
})

const tmdbTitleSeasonSchema = z.object({
  air_date: z.string().nullable().optional(),
  episode_count: z.number().nullable().optional(),
  name: z.string().nullable().optional(),
  poster_path: z.string().nullable().optional(),
  season_number: z.number().nullable().optional(),
})

export const tmdbMovieTitleDetailsSchema = tmdbMovieDetailsSchema.extend({
  credits: tmdbCreditsSchema.optional(),
  original_language: z.string().optional(),
  release_dates: tmdbReleaseDatesSchema.optional(),
  vote_count: z.number().optional(),
})

export const tmdbTvTitleDetailsSchema = tmdbTvDetailsSchema.extend({
  aggregate_credits: tmdbAggregateCreditsSchema.optional(),
  content_ratings: tmdbContentRatingsSchema.optional(),
  created_by: z
    .array(
      z.object({
        id: z.number().optional(),
        name: z.string(),
      }),
    )
    .optional(),
  credits: tmdbCreditsSchema.optional(),
  networks: z
    .array(
      z.object({
        id: z.number().optional(),
        name: z.string(),
      }),
    )
    .optional(),
  original_language: z.string().optional(),
  seasons: z.array(tmdbTitleSeasonSchema).optional(),
  vote_count: z.number().optional(),
})

export type TmdbMovieTitleDetails = z.infer<typeof tmdbMovieTitleDetailsSchema>
export type TmdbTvTitleDetails = z.infer<typeof tmdbTvTitleDetailsSchema>

const tmdbReviewAuthorSchema = z.object({
  avatar_path: z.string().nullable().optional(),
  name: z.string().optional(),
  rating: z.number().nullable().optional(),
  username: z.string().optional(),
})

const tmdbReviewSchema = z.object({
  author: z.string().optional(),
  author_details: tmdbReviewAuthorSchema.optional(),
  content: z.string().nullable().optional(),
  created_at: z.string().optional(),
  id: z.string(),
})

export const tmdbReviewsResponseSchema = z.object({
  page: z.number(),
  results: z.array(tmdbReviewSchema),
  total_pages: z.number(),
  total_results: z.number(),
})

export type TmdbReview = z.infer<typeof tmdbReviewSchema>
export type TmdbReviewsResponse = z.infer<typeof tmdbReviewsResponseSchema>
