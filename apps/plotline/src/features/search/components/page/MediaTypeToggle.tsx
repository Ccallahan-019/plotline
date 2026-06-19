"use client";

import { Film, Tv } from "lucide-react";

import { ToggleGroupItem } from "@/components/ui/toggle-group";
import { ToggleGroup } from "@/components/ui/toggle-group";

import type { SearchMediaType } from "../../types";

import { useMediaType } from "../../providers/MediaTypeProvider";
import { useSearchFilters } from "../../providers/SearchFiltersProvider";
import { useTmdbBrowse } from "../../providers/TmdbBrowseProvider";

export function MediaTypeToggle() {
  const { mediaType, setMediaType } = useMediaType();
  const { clearGenreFilters, clearProviderFilters } = useSearchFilters();
  const { setPage } = useTmdbBrowse();

  const handleChange = (value: string[]) => {
    if (!value.length) {
      return;
    }

    setMediaType(value[0] as SearchMediaType);
    clearGenreFilters();
    clearProviderFilters();
    setPage(1);
  };

  return (
    <ToggleGroup
      onValueChange={handleChange}
      value={[mediaType]}
      variant="outline"
    >
      <ToggleGroupItem className="flex items-center gap-2" value="movie">
        <Film />
        Film
      </ToggleGroupItem>
      <ToggleGroupItem className="flex items-center gap-2" value="tv">
        <Tv />
        TV
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
