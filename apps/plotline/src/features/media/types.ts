export type MediaDisplay = MovieDisplay | TvDisplay;

type MediaDisplayBase = {
  overview?: null | string;
  posterPath?: null | string;
  releaseDate?: null | string;
  runtime?: null | number;
  title: string;
  tmdbId?: number;
};

type MovieDisplay = {
  mediaType: "movie";
  runtime?: null | number;
} & MediaDisplayBase;

type TvDisplay = {
  episodeCount?: null | number;
  mediaType: "tv";
} & MediaDisplayBase;
