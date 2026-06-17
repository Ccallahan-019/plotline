import { LibraryItem, Media } from "@plotline/payload-types";

import { toMediaDisplayFromMedia } from "@/features/media/services/media-display";
import { MediaDisplay } from "@/features/media/types";

export function getMediaFromLibraryItem(item: LibraryItem): Media | null {
  return typeof item.media === "object" ? item.media : null;
}

export function toMediaDisplayFromLibraryItem(
  item: LibraryItem,
): MediaDisplay | null {
  const media = getMediaFromLibraryItem(item);

  if (!media) {
    return null;
  }

  return toMediaDisplayFromMedia(media);
}
