"use client";

import type { LibraryItem } from "@plotline/payload-types";

import { ShowIf } from "@/components/utils/ShowIf";
import { MediaListItem } from "@/features/media/components/MediaListItem";

import {
  getMediaFromLibraryItem,
  toMediaDisplayFromLibraryItem,
} from "../services/media-display";
import { LogWatchButton } from "./LogWatchButton";
import { StatusBadge } from "./StatusBadge";

type LibraryListItemProps = {
  item: LibraryItem;
};

export function LibraryListItem({ item }: LibraryListItemProps) {
  const mediaDisplay = toMediaDisplayFromLibraryItem(item);
  const media = getMediaFromLibraryItem(item);

  if (!mediaDisplay || !media) {
    return null;
  }

  const showLogWatch = item.status !== "completed";

  return (
    <MediaListItem
      actions={
        <ShowIf condition={showLogWatch}>
          <LogWatchButton media={media} />
          <StatusBadge status={item.status} />
        </ShowIf>
      }
      media={mediaDisplay}
    />
  );
}
