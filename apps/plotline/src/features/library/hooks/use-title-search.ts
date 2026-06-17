import { TmdbSearchResultItem } from "@plotline/shared/tmdb";
import { useMemo, useState } from "react";

import { useTmdbSearch } from "@/lib/query/hooks/use-tmdb-search";

import { toSearchItems } from "../services/to-search-items";
import { TitleSearchItem } from "../types";

type UseTitleSearchProps = {
  onSelect: (result: TmdbSearchResultItem) => void;
};

export const useTitleSearch = ({ onSelect }: UseTitleSearchProps) => {
  const [searchValue, setSearchValue] = useState("");
  const trimmedSearch = searchValue.trim();
  const { data, isFetching, isLoading } = useTmdbSearch(searchValue);

  const items: TitleSearchItem[] = useMemo(
    () => toSearchItems(data?.results ?? []),
    [data?.results],
  );

  const handleValueChange = (item: null | TitleSearchItem) => {
    if (item) {
      onSelect(item.result);
    }
    setSearchValue("");
  };

  const handleInputValueChange = (value: string) => {
    setSearchValue(value);
  };

  const emptyMessage =
    isLoading || isFetching
      ? "Searching…"
      : `No results for "${trimmedSearch}"`;

  return {
    emptyMessage,
    handleInputValueChange,
    handleValueChange,
    isFetching,
    items,
  };
};
