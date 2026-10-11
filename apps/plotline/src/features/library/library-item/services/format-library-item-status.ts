import { MediaStatus } from '@plotline/shared/constants'

type Status = 'untracked' | MediaStatus

const STATUS_LABELS: Record<Status, string> = {
  completed: 'Completed',
  dropped: 'Dropped',
  on_hold: 'On Hold',
  planned: 'Planned',
  untracked: 'Untracked',
  watching: 'Watching',
}

export function formatLibraryItemStatus(status: Status): string {
  return STATUS_LABELS[status]
}
