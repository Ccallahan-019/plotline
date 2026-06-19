"use client";

import { formatNumber } from "@plotline/shared/utils/formatNumber";

import { ShowIf } from "@/components/utils/ShowIf";

import { useBrowseMode } from "../../providers/BrowseModeProvider";
import { useMediaType } from "../../providers/MediaTypeProvider";
import { useTmdbBrowse } from "../../providers/TmdbBrowseProvider";

export function ResultsTitle() {
  const { mode } = useBrowseMode();
  const { query, searchResults } = useTmdbBrowse();
  const { mediaType } = useMediaType();

  const hasQuery = query.trim() !== "";
  const isMovie = mediaType === "movie";
  const isDiscoverMode = mode === "discover";
  const resultsCount = searchResults?.total_results ?? 0;

  const title = `${formatNumber(resultsCount)} ${isMovie ? "Movies" : "TV Series"}`;

  const noSearchText = "No search results";

  const subTitle = hasQuery
    ? "matching"
    : !isDiscoverMode
      ? noSearchText
      : null;
  const formattedQuery = hasQuery ? `"${query}"` : null;

  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-xl font-medium">{title}</h1>

      <ShowIf condition={!!subTitle}>
        <p className="text-sm text-muted-foreground">
          {subTitle}{" "}
          <ShowIf condition={!!formattedQuery}>
            <span className="font-medium italic">{formattedQuery}</span>
          </ShowIf>
        </p>
      </ShowIf>
    </div>
  );
}
