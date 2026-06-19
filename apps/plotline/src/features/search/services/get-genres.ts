import { Genre } from "../types";

const INITIAL_VISIBLE_COUNT = 5;

export function getHiddenGenres(
  visibleGenres: Genre[],
  allGenres: Genre[],
): Genre[] {
  const visibleIds = new Set(visibleGenres.map((genre) => genre.id));
  return allGenres.filter((genre) => !visibleIds.has(genre.id));
}

export function getVisibleGenres(
  genres: Genre[],
  selectedGenreIds: number[],
): Genre[] {
  const selectedIds = new Set(selectedGenreIds);

  if (selectedGenreIds.length > INITIAL_VISIBLE_COUNT) {
    return genres.filter((genre) => selectedIds.has(genre.id));
  }

  return sortGenresWithSelectedFirst(genres, selectedGenreIds).slice(
    0,
    INITIAL_VISIBLE_COUNT,
  );
}

export function sortGenresWithSelectedFirst(
  genres: Genre[],
  selectedGenreIds: number[],
): Genre[] {
  const selectedIds = new Set(selectedGenreIds);
  const selected: Genre[] = [];
  const unselected: Genre[] = [];

  for (const genre of genres) {
    if (selectedIds.has(genre.id)) {
      selected.push(genre);
    } else {
      unselected.push(genre);
    }
  }

  return [...selected, ...unselected];
}
