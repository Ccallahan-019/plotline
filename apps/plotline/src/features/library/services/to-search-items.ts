import { TmdbSearchResultItem } from "@plotline/shared/tmdb";

import { toMediaDisplayFromTmdbResult } from "@/features/media/services/media-display";

import { TitleSearchItem } from "../types";

export function toSearchItems(
  results: TmdbSearchResultItem[],
): TitleSearchItem[] {
  return results.flatMap((result) => {
    const display = toMediaDisplayFromTmdbResult(result);

    if (!display) {
      return [];
    }

    return [
      {
        display,
        id: `${result.id}-${result.media_type ?? "unknown"}`,
        label: display.title,
        result,
      },
    ];
  });
}
