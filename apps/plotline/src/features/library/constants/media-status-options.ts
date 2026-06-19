import type { MediaStatus } from "@plotline/shared/constants/media";

import { MEDIA_STATUSES } from "@plotline/shared/constants/media";

export const MEDIA_STATUS_LABELS: Record<MediaStatus, string> = {
  completed: "Completed",
  dropped: "Dropped",
  on_hold: "On Hold",
  planned: "Planned",
  watching: "Watching",
};

export const MEDIA_STATUS_OPTIONS = MEDIA_STATUSES.map((status) => ({
  label: MEDIA_STATUS_LABELS[status],
  value: status,
}));
