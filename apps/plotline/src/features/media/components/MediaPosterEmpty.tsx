import { Link2Off } from "lucide-react";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Empty, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { ShowIf } from "@/components/utils/ShowIf";
import { cn } from "@/lib/utils";

import { RatingBadge } from "./RatingBadge";

type MediaPosterEmptyProps = {
  className?: string;
  rating?: null | number;
  ratio: number;
  showRating?: boolean;
};

export function MediaPosterEmpty({
  className,
  rating,
  ratio,
  showRating = true,
}: MediaPosterEmptyProps) {
  return (
    <AspectRatio
      className={cn("w-full relative bg-muted rounded-md", className)}
      ratio={ratio}
    >
      <ShowIf condition={showRating}>
        <RatingBadge rating={rating} />
      </ShowIf>
      <Empty className="h-full">
        <EmptyMedia variant="icon">
          <Link2Off />
        </EmptyMedia>
        <EmptyTitle>No Media Poster Available</EmptyTitle>
      </Empty>
    </AspectRatio>
  );
}
