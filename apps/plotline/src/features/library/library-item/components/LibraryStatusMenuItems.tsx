'use client'

import type { MediaStatus } from '@plotline/shared/constants'

import { Check } from 'lucide-react'

import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { StatusDot } from '@/components/utils/StatusDot'
import { MEDIA_STATUS_OPTIONS } from '@/features/library/constants/media-status-options'
import { cn } from '@/lib/utils'

type LibraryStatusMenuItemsProps = {
  currentStatus?: MediaStatus | null
  disabled?: boolean
  onStatusChange: (status: MediaStatus) => void
}

export function LibraryStatusMenuItems({
  currentStatus,
  disabled = false,
  onStatusChange,
}: LibraryStatusMenuItemsProps) {
  return (
    <DropdownMenuGroup>
      <DropdownMenuLabel>Move to...</DropdownMenuLabel>
      {MEDIA_STATUS_OPTIONS.map((option) => (
        <DropdownMenuItem
          className="flex min-w-36 items-center justify-between gap-2"
          disabled={disabled}
          key={option.value}
          onClick={() => onStatusChange(option.value)}
        >
          <span className="flex items-center gap-2">
            <StatusDot status={option.value} />
            {option.label}
          </span>
          <Check
            aria-hidden
            className={cn(option.value === currentStatus ? 'opacity-100' : 'opacity-0')}
          />
        </DropdownMenuItem>
      ))}
    </DropdownMenuGroup>
  )
}
