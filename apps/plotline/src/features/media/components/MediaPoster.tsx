import Image from "next/image";

import { getPosterUrl } from "@/features/media/services/media-display";
import { MediaDisplay } from "@/features/media/types";
import { cn } from "@/lib/utils";

import { AspectRatio } from "../../../components/ui/aspect-ratio";

type MediaPosterProps = {
  className?: string;
  media: MediaDisplay;
  ratio: number;
};

export function MediaPoster({ className, media, ratio }: MediaPosterProps) {
  const posterUrl = getPosterUrl(media.posterPath);

  if (!posterUrl) {
    return (
      <AspectRatio className={cn("bg-muted", className)} ratio={ratio}>
        <div className="absolute inset-0 flex items-center justify-center px-4 text-center text-sm text-muted-foreground">
          No poster
        </div>
      </AspectRatio>
    );
  }

  return (
    <AspectRatio className={cn("bg-muted", className)} ratio={ratio}>
      <Image
        alt={`${media.title} poster`}
        className="absolute inset-0 h-full w-full object-cover"
        fill
        src={posterUrl}
      />
    </AspectRatio>
  );
}
