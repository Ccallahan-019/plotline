import { Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";

type RatingBadgeProps = {
  rating?: null | number;
};

export function RatingBadge({ rating }: RatingBadgeProps) {
  if (rating == null) return null;

  return (
    <Badge className="absolute top-2 right-2 z-10 " variant="secondary">
      <Star
        className="text-yellow-500"
        data-icon="inline-start"
        fill="currentColor"
      />

      {rating.toFixed(1)}
    </Badge>
  );
}
