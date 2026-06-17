"use client";

import Link from "next/link";
import { ReactNode } from "react";

import {
  Item,
  ItemContent,
  ItemDescription,
  ItemHeader,
  ItemTitle,
} from "@/components/ui/item";
import { ShowIf } from "@/components/utils/ShowIf";
import { MediaPoster } from "@/features/media/components/MediaPoster";
import { cn } from "@/lib/utils";

import type { MediaDisplay } from "../types";

import { getMediaItemDisplay } from "../services/get-media-item-display";

type MediaGridItemProps = {
  actions?: ReactNode;
  className?: string;
  href?: string;
  media: MediaDisplay;
  subtitle?: string;
};

export function MediaGridItem({
  actions,
  className,
  href,
  media,
  subtitle,
}: MediaGridItemProps) {
  const { cardSubtitle, titleHref } = getMediaItemDisplay({
    href,
    media,
    subtitle,
  });

  return (
    <Item
      className={cn("overflow-hidden p-0", className)}
      render={
        <Link href={titleHref}>
          <ItemHeader>
            <MediaPoster media={media} ratio={2 / 3} />
          </ItemHeader>

          <ItemContent className="gap-1 p-4">
            <ItemTitle className="line-clamp-2 text-base">
              {media.title}
            </ItemTitle>
            <ItemDescription>{cardSubtitle}</ItemDescription>
          </ItemContent>

          <ShowIf condition={!!actions}>{actions}</ShowIf>
        </Link>
      }
      variant="outline"
    />
  );
}
