"use client";

import { TmdbSearchResultItem } from "@plotline/shared/tmdb";

import { AddToLibraryPopover } from "@/features/library/components/add-to-library/AddToLibraryPopover";
import { LibraryPosterStatusBadge } from "@/features/library/components/add-to-library/LibraryPosterStatusBadge";
import { MediaGridItem } from "@/features/media/components/MediaGridItem";
import { toMediaDisplayFromTmdbResult } from "@/features/media/services/media-display";
import { useOpenState } from "@/providers/OpenStateProvider";

import { useSearchLibraryItems } from "../../providers/SearchLibraryItemsProvider";

type SearchResultMediaGridItemProps = {
  item: TmdbSearchResultItem;
};

export function SearchResultMediaGridItem({
  item,
}: SearchResultMediaGridItemProps) {
  const { getLibraryItemForMedia } = useSearchLibraryItems();
  const { isOpen } = useOpenState();

  const media = toMediaDisplayFromTmdbResult(item);

  if (media === null) {
    return null;
  }

  const existingLibraryItem = getLibraryItemForMedia(media);

  return (
    <MediaGridItem
      animate={!isOpen}
      media={media}
      posterOverlay={
        <div className="absolute bottom-1 flex items-center justify-center gap-2 w-full">
          <LibraryPosterStatusBadge
            status={existingLibraryItem?.status ?? "untracked"}
          />

          <AddToLibraryPopover
            existingLibraryItem={existingLibraryItem}
            media={media}
          />
        </div>
      }
    />
  );
}
