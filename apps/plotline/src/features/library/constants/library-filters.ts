import type { MediaStatus, MediaType } from "@plotline/shared/constants/media";

import type { LibraryFilters } from "@/lib/query/services/keys";

export const LIBRARY_STATUS_SEGMENTS: Record<string, MediaStatus> = {
  completed: "completed",
  dropped: "dropped",
  "on-hold": "on_hold",
  planned: "planned",
  watching: "watching",
};

export const LIBRARY_TYPE_SEGMENTS: Record<string, MediaType> = {
  movies: "movie",
  tv: "tv",
};

export type LibraryRouteSegment =
  | keyof typeof LIBRARY_STATUS_SEGMENTS
  | keyof typeof LIBRARY_TYPE_SEGMENTS;

export function getLibraryEmptyCopy(filters: LibraryFilters): {
  description: string;
  title: string;
} {
  if (filters.status === "watching") {
    return {
      description: "Start watching something from your planned list or search.",
      title: "Nothing in progress",
    };
  }

  if (filters.status === "planned") {
    return {
      description: "Search TMDB and add titles you want to watch.",
      title: "No planned titles",
    };
  }

  if (filters.status === "completed") {
    return {
      description: "Log watches as you finish titles to build your history.",
      title: "No completed titles",
    };
  }

  if (filters.status === "on_hold") {
    return {
      description: "Titles you pause will appear here.",
      title: "Nothing on hold",
    };
  }

  if (filters.status === "dropped") {
    return {
      description: "Titles you drop will appear here.",
      title: "No dropped titles",
    };
  }

  if (filters.mediaType === "movie") {
    return {
      description: "Add movies from search to see them here.",
      title: "No movies in your library",
    };
  }

  if (filters.mediaType === "tv") {
    return {
      description: "Add TV shows from search to see them here.",
      title: "No TV shows in your library",
    };
  }

  return {
    description: "Search TMDB and add titles to start tracking.",
    title: "Your library is empty",
  };
}

export function getLibraryFiltersFromSegment(
  segment?: string,
): LibraryFilters {
  if (!segment) {
    return {};
  }

  const status = LIBRARY_STATUS_SEGMENTS[segment];

  if (status) {
    return { status };
  }

  const mediaType = LIBRARY_TYPE_SEGMENTS[segment];

  if (mediaType) {
    return { mediaType };
  }

  return {};
}
