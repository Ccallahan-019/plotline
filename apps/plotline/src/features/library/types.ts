import { TmdbSearchResultItem } from "@plotline/shared/tmdb";

import type { MediaDisplay } from "@/features/media/types";

export type TitleSearchItem = {
  display: MediaDisplay;
  id: string;
  label: string;
  result: TmdbSearchResultItem;
};
