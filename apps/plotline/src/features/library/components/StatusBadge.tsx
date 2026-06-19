import type { MediaStatus } from "@plotline/shared/constants/media";

import {
  Check,
  ClockCheck,
  EyeOff,
  LucideIcon,
  Pause,
  Trash,
  TvMinimalPlay,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type Status = "untracked" | MediaStatus;

const STATUS_LABELS: Record<Status, string> = {
  completed: "Completed",
  dropped: "Dropped",
  on_hold: "On Hold",
  planned: "Planned",
  untracked: "Untracked",
  watching: "Watching",
};

const STATUS_ICONS: Record<Status, LucideIcon> = {
  completed: Check,
  dropped: Trash,
  on_hold: Pause,
  planned: ClockCheck,
  untracked: EyeOff,
  watching: TvMinimalPlay,
};

const STATUS_BG_COLORS: Record<Status, string> = {
  completed: "bg-green-100 dark:bg-emerald-900",
  dropped: "bg-red-100 dark:bg-red-900",
  on_hold: "bg-yellow-100 dark:bg-purple-900",
  planned: "bg-blue-100 dark:bg-sky-900",
  untracked: "bg-gray-100 dark:bg-gray-900",
  watching: "bg-purple-100 dark:bg-amber-900",
};

const STATUS_TEXT_COLORS: Record<Status, string> = {
  completed: "text-green-800 dark:text-emerald-100",
  dropped: "text-red-800 dark:text-red-100",
  on_hold: "text-amber-800 dark:text-purple-100",
  planned: "text-blue-800 dark:text-sky-100",
  untracked: "text-gray-800 dark:text-gray-100",
  watching: "text-purple-800 dark:text-amber-100",
};

type StatusBadgeProps = {
  className?: string;
  status: Status;
};

export function StatusBadge({ className, status }: StatusBadgeProps) {
  const Icon = STATUS_ICONS[status];

  const label = STATUS_LABELS[status];

  return (
    <Badge
      className={cn(
        className,
        STATUS_BG_COLORS[status],
        STATUS_TEXT_COLORS[status],
      )}
      variant="default"
    >
      <Icon />
      {label}
    </Badge>
  );
}
