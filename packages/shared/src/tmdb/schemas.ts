import { z } from "zod";

const genreSchema = z.object({
  id: z.number(),
  name: z.string(),
});

const searchResultItemSchema = z.object({
  backdrop_path: z.string().nullable().optional(),
  first_air_date: z.string().optional(),
  id: z.number(),
  media_type: z.enum(["movie", "tv"]).optional(),
  name: z.string().optional(),
  original_name: z.string().optional(),
  original_title: z.string().optional(),
  overview: z.string().nullable().optional(),
  popularity: z.number().optional(),
  poster_path: z.string().nullable().optional(),
  release_date: z.string().optional(),
  title: z.string().optional(),
  vote_average: z.number().optional(),
});

export const tmdbSearchResponseSchema = z.object({
  page: z.number(),
  results: z.array(searchResultItemSchema),
  total_pages: z.number(),
  total_results: z.number(),
});

export type TmdbSearchResponse = z.infer<typeof tmdbSearchResponseSchema>;
export type TmdbSearchResultItem = z.infer<typeof searchResultItemSchema>;

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
});

export const tmdbMovieDetailsSchema = movieDetailsSchema;

export type TmdbMovieDetails = z.infer<typeof tmdbMovieDetailsSchema>;

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
  status: z.string().optional(),
  vote_average: z.number().optional(),
});

export const tmdbTvDetailsSchema = tvDetailsSchema;

export type TmdbTvDetails = z.infer<typeof tmdbTvDetailsSchema>;
