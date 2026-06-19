"use client";

import { motion } from "motion/react";
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
import { cn } from "@/lib/utils";

import type { MediaDisplay } from "../types";

import { getMediaItemDisplay } from "../services/get-media-item-display";

type MediaGridItemProps = {
  actions?: ReactNode;
  animate?: boolean;
  className?: string;
  href?: string;
  media: MediaDisplay | null;
  posterOverlay?: ReactNode;
  subtitle?: string;
};

export function MediaGridItem({
  actions,
  animate = true,
  className,
  href,
  media,
  posterOverlay,
  subtitle,
}: MediaGridItemProps) {
  if (!media) {
    return null;
  }

  const { cardSubtitle, titleHref } = getMediaItemDisplay({
    href,
    media,
    subtitle,
  });

  return (
    <motion.div className="h-full" whileHover={animate ? { y: -3 } : undefined}>
      <Item className={cn("overflow-hidden p-0 items-start", className)}>
        <ItemHeader className="relative w-full">
          <Link className="block w-full" href={titleHref}>
            <MediaPoster media={media} ratio={2 / 3} />
          </Link>

          <ShowIf condition={!!posterOverlay}>{posterOverlay}</ShowIf>
        </ItemHeader>

        <ItemContent>
          <ItemTitle>{media.title}</ItemTitle>
          <ItemDescription>{cardSubtitle}</ItemDescription>
          <ShowIf condition={!!actions}>
            <ItemActions>{actions}</ItemActions>
          </ShowIf>
        </ItemContent>
      </Item>
    </motion.div>
  );
}
