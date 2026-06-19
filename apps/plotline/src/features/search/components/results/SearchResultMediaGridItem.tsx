"use client";

import { TmdbSearchResultItem } from "@plotline/shared/tmdb";

import { AddToLibraryPopover } from "@/features/library/components/add-to-library/AddToLibraryPopover";
import { LibraryPosterStatusBadge } from "@/features/library/components/add-to-library/LibraryPosterStatusBadge";
import { MediaGridItem } from "@/features/media/components/MediaGridItem";
import { toMediaDisplayFromTmdbResult } from "@/features/media/services/media-display";

import { useSearchLibraryItems } from "../../providers/SearchLibraryItemsProvider";

type SearchResultMediaGridItemProps = {
  item: TmdbSearchResultItem;
};

export function SearchResultMediaGridItem({
  item,
}: SearchResultMediaGridItemProps) {
  const { getLibraryItemForMedia } = useSearchLibraryItems();

  const media = toMediaDisplayFromTmdbResult(item);

  if (media === null) {
    return null;
  }

  const existingLibraryItem = getLibraryItemForMedia(media);

  return (
    <MediaGridItem
      media={media}
      posterOverlay={(isHovered) => (
        <div className="absolute bottom-1 right-1 flex items-center justify-end gap-2 w-full">
          <LibraryPosterStatusBadge
            animationKey={existingLibraryItem?.id?.toString() ?? ""}
            status={existingLibraryItem?.status ?? "untracked"}
            triggerAnimation={isHovered}
          />

          <AddToLibraryPopover
            existingLibraryItem={existingLibraryItem}
            media={media}
          />
        </div>
      )}
    />
  );
}
