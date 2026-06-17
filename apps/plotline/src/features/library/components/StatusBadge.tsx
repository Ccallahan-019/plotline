import type { MediaStatus } from "@plotline/shared/constants/media";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<MediaStatus, string> = {
  completed: "Completed",
  dropped: "Dropped",
  on_hold: "On Hold",
  planned: "Planned",
  watching: "Watching",
};

const STATUS_VARIANTS: Record<
  MediaStatus,
  "default" | "destructive" | "outline" | "secondary"
> = {
  completed: "secondary",
  dropped: "destructive",
  on_hold: "outline",
  planned: "outline",
  watching: "default",
};

type StatusBadgeProps = {
  className?: string;
  status: MediaStatus;
};

export function StatusBadge({ className, status }: StatusBadgeProps) {
  return (
    <Badge className={cn(className)} variant={STATUS_VARIANTS[status]}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
