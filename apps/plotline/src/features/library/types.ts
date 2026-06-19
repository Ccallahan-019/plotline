import { TmdbSearchResultItem } from "@plotline/shared/tmdb";

import type { MediaDisplay } from "@/features/media/types";

export type TitleSearchItem = {
  display: MediaDisplay;
  id: string;
  label: string;
  result: TmdbSearchResultItem;
};

export type WatchlistComboboxItem = {
  disabled?: boolean;
  id: string;
  label: string;
  watchlistId: number;
};
