import { MediaStatus } from '@plotline/shared/constants'
import { Circle } from 'lucide-react'

import { cn } from '@/lib/utils'

type Status = 'untracked' | MediaStatus

const STATUS_DOT_COLORS: Record<Status, string> = {
  completed: 'text-emerald-700',
  dropped: 'text-red-700',
  on_hold: 'text-purple-700',
  planned: 'text-sky-700',
  untracked: 'text-gray-700',
  watching: 'text-amber-700',
}

type StatusDotProps = {
  status: Status
}

export function StatusDot({ status }: StatusDotProps) {
  return <Circle className={cn(STATUS_DOT_COLORS[status], 'size-2')} fill="currentColor" />
}
