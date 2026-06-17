import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { ShowIf } from "@/components/utils/ShowIf";

import { getMediaItemDisplay } from "../services/get-media-item-display";
import { MediaDisplay } from "../types";

type MediaListItemProps = {
  actions?: ReactNode;
  className?: string;
  href?: string;
  media: MediaDisplay;
  subtitle?: string;
};

export function MediaListItem({
  actions,
  className,
  href,
  media,
  subtitle,
}: MediaListItemProps) {
  const { cardSubtitle, titleHref } = getMediaItemDisplay({
    href,
    media,
    subtitle,
    variant: "list",
  });

  const showMediaCondition = media.posterPath
    ? media.posterPath.trim().length > 0
    : false;

  return (
    <Item
      className={className}
      render={
        <Link href={titleHref}>
          <ShowIf condition={showMediaCondition}>
            <ItemMedia variant="image">
              <Image
                alt={media.title}
                height={90}
                src={media.posterPath ?? ""}
                width={60}
              />
            </ItemMedia>
          </ShowIf>

          <ItemContent>
            <ItemTitle>{media.title}</ItemTitle>
            <ItemDescription>{cardSubtitle}</ItemDescription>
          </ItemContent>

          <ShowIf condition={!!actions}>{actions}</ShowIf>
        </Link>
      }
      role="listitem"
    />
  );
}
