"use client";

import Link from "next/link";
import { ReactNode } from "react";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemHeader,
  ItemTitle,
} from "@/components/ui/item";
import { ShowIf } from "@/components/utils/ShowIf";
import { MediaPoster } from "@/features/media/components/MediaPoster";
import { useHover } from "@/hooks/use-hover";
import { cn } from "@/lib/utils";

import type { MediaDisplay } from "../types";

import { getMediaItemDisplay } from "../services/get-media-item-display";

type MediaGridItemProps = {
  actions?: ReactNode;
  className?: string;
  href?: string;
  media: MediaDisplay | null;
  posterOverlay?: (isHovered: boolean) => ReactNode;
  subtitle?: string;
};

export function MediaGridItem({
  actions,

  className,
  href,
  media,
  posterOverlay,
  subtitle,
}: MediaGridItemProps) {
  const [ref, isHovered] = useHover<HTMLDivElement>();

  if (!media) {
    return null;
  }

  const { cardSubtitle, titleHref } = getMediaItemDisplay({
    href,
    media,
    subtitle,
  });

  return (
    <Item className={cn("overflow-hidden p-0 items-start", className)}>
      <ItemHeader className="relative w-full" ref={ref}>
        <Link className="block w-full" href={titleHref}>
          <MediaPoster media={media} ratio={2 / 3} />
        </Link>

        <ShowIf condition={!!posterOverlay}>
          {posterOverlay?.(isHovered)}
        </ShowIf>
      </ItemHeader>

      <ItemContent>
        <ItemTitle>{media.title}</ItemTitle>
        <ItemDescription>{cardSubtitle}</ItemDescription>
        <ShowIf condition={!!actions}>
          <ItemActions>{actions}</ItemActions>
        </ShowIf>
      </ItemContent>
    </Item>
  );
}
