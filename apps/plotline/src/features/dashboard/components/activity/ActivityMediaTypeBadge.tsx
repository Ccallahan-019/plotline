import { MediaType } from '@plotline/shared/constants'

import { Badge } from '@/components/ui/badge'

import { activityMediaTypeLabel } from '../../services/activity-display'

type ActivityMediaTypeBadgeProps = {
  mediaType: MediaType | null
}

export function ActivityMediaTypeBadge({ mediaType }: ActivityMediaTypeBadgeProps) {
  if (mediaType == null) {
    return null
  }

  return <Badge variant="outline">{activityMediaTypeLabel(mediaType)}</Badge>
}
