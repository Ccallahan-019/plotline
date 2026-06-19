import { useState } from "react";

import { useSearchFilters } from "../providers/SearchFiltersProvider";
import { getHiddenGenres, getVisibleGenres } from "../services/get-genres";
import { Genre } from "../types";

type UseExpandedGenresProps = {
  genres: Genre[];
};

export function useExpandedGenres({ genres }: UseExpandedGenresProps) {
  const { draftFilters } = useSearchFilters();
  const selectedGenreIds = draftFilters.genreIds ?? [];

  const [expanded, setExpanded] = useState(false);

  const visibleGenres = getVisibleGenres(genres, selectedGenreIds);
  const hiddenGenres = getHiddenGenres(visibleGenres, genres);
  const hasHiddenGenres = hiddenGenres.length > 0;
  const triggerText = expanded
    ? "Show less"
    : `Show all ${genres.length} genres`;

  return {
    expanded,
    hasHiddenGenres,
    hiddenGenres,
    setExpanded,
    triggerText,
    visibleGenres,
  };
}
