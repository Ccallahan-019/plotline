import type { LibraryItem, Media } from "@plotline/payload-types";
import type { TmdbSearchResultItem } from "@plotline/shared/tmdb";

import { MediaDisplay } from "../types";

const TMDB_POSTER_BASE = "https://image.tmdb.org/t/p/w342";

export function formatEpisodeCount(
  episodeCount?: null | number,
): null | string {
  if (!episodeCount) {
    return null;
  }

  return `${episodeCount} episodes`;
}

export function formatReleaseYear(releaseDate?: null | string): null | string {
  if (!releaseDate) {
    return null;
  }

  const year = releaseDate.slice(0, 4);

  return /^\d{4}$/.test(year) ? year : null;
}

export function formatRuntime(runtime?: null | number): null | string {
  if (!runtime) {
    return null;
  }

  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;

  return `${hours}h ${minutes}m`;
}

export function getMediaFromLibraryItem(item: LibraryItem): Media | null {
  return typeof item.media === "object" ? item.media : null;
}

export function getMediaId(media: Media | number): number {
  return typeof media === "object" ? media.id : media;
}

export function getPosterUrl(posterPath?: null | string): string | undefined {
  if (!posterPath) {
    return undefined;
  }

  return `${TMDB_POSTER_BASE}${posterPath}`;
}

export function getTitleHref(media: MediaDisplay): string {
  const tmdbId = media.tmdbId;

  if (tmdbId === undefined) {
    return "/dashboard/library";
  }

  return `/dashboard/title/${media.mediaType}/${tmdbId}`;
}

export function toMediaDisplayFromLibraryItem(
  item: LibraryItem,
): MediaDisplay | null {
  const media = getMediaFromLibraryItem(item);

  if (!media) {
    return null;
  }

  return toMediaDisplayFromMedia(media);
}

export function toMediaDisplayFromMedia(media: Media): MediaDisplay {
  if (media.mediaType === "movie") {
    return {
      mediaType: "movie",
      overview: media.overview,
      posterPath: media.posterPath,
      releaseDate: media.releaseDate,
      runtime: media.runtime,
      title: media.title,
    };
  }

  return {
    episodeCount: media.tvMeta?.episodeCount,
    mediaType: "tv",
    overview: media.overview,
    posterPath: media.posterPath,
    releaseDate: media.releaseDate,
    runtime: media.runtime,
    title: media.title,
  };
}

export function toMediaDisplayFromTmdbResult(
  result: TmdbSearchResultItem,
): MediaDisplay | null {
  const mediaType = result.media_type;

  if (mediaType !== "movie" && mediaType !== "tv") {
    return null;
  }

  const title =
    mediaType === "movie"
      ? (result.title ?? result.original_title ?? "Untitled")
      : (result.name ?? result.original_name ?? "Untitled");

  if (mediaType === "movie") {
    return {
      mediaType: "movie",
      overview: result.overview,
      posterPath: result.poster_path,
      releaseDate: result.release_date,
      runtime: result.runtime,
      title,
    };
  }

  return {
    episodeCount: result.number_of_episodes,
    mediaType: "tv",
    overview: result.overview,
    posterPath: result.poster_path,
    releaseDate: result.release_date ?? result.first_air_date,
    title,
  };
}
