import Image from "next/image";

import { ShowIf } from "@/components/utils/ShowIf";
import { getPosterUrl } from "@/features/media/services/media-display";
import { MediaDisplay } from "@/features/media/types";
import { cn } from "@/lib/utils";

import { AspectRatio } from "../../../components/ui/aspect-ratio";
import { MediaPosterEmpty } from "./MediaPosterEmpty";
import { RatingBadge } from "./RatingBadge";

type MediaPosterProps = {
  className?: string;
  media: MediaDisplay;
  ratio: number;
  showRating?: boolean;
};

export function MediaPoster({
  className,
  media,
  ratio,
  showRating = true,
}: MediaPosterProps) {
  const posterUrl = getPosterUrl(media.posterPath);

  if (!posterUrl) {
    return (
      <MediaPosterEmpty
        className={className}
        rating={media.voteAverage}
        ratio={ratio}
        showRating={showRating}
      />
    );
  }

  return (
    <AspectRatio
      className={cn(
        "w-full relative bg-muted rounded-md overflow-hidden",
        className,
      )}
      ratio={ratio}
    >
      <ShowIf condition={showRating}>
        <RatingBadge rating={media.voteAverage} />
      </ShowIf>
      <Image
        alt={`${media.title} poster`}
        className="absolute inset-0 object-cover"
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        src={posterUrl}
      />
    </AspectRatio>
  );
}
