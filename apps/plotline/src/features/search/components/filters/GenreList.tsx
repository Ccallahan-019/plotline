"use client";

import { useSearchFilters } from "../../providers/SearchFiltersProvider";
import { sortGenresWithSelectedFirst } from "../../services/get-genres";
import { Genre } from "../../types";
import { FilterCheckbox } from "./FilterCheckbox";

type GenreListProps = {
  genreList: Genre[];
};

export function GenreList({ genreList }: GenreListProps) {
  const { draftFilters, setDraftFilters } = useSearchFilters();

  const selectedGenreIds = draftFilters.genreIds ?? [];

  const toggleGenre = (genreId: number, checked: boolean) => {
    setDraftFilters({
      ...draftFilters,
      genreIds: checked
        ? [...selectedGenreIds, genreId]
        : selectedGenreIds.filter((id) => id !== genreId),
    });
  };

  const sortedGenreList = sortGenresWithSelectedFirst(
    genreList,
    selectedGenreIds,
  );

  return sortedGenreList.map((genre) => (
    <FilterCheckbox
      fieldIdPrefix="genre"
      filterItem={genre}
      isChecked={selectedGenreIds.includes(genre.id)}
      key={genre.id}
      onToggle={toggleGenre}
    />
  ));
}
