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

/**
 * Display label for a library status.
 *
 * @param status - A library status, or `untracked` for a title not in the library
 * @returns The label shown in menus and buttons
 */
export function formatLibraryItemStatus(status: Status): string {
  return STATUS_LABELS[status]
}
