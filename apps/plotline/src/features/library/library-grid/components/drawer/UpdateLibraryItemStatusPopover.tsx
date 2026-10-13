'use client'

import type { LibraryItem } from '@plotline/payload-types'
import type { MediaStatus } from '@plotline/shared/constants'

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import {
  MEDIA_STATUS_LABELS,
  MEDIA_STATUS_OPTIONS,
} from '@/features/library/constants/media-status-options'

import { useUpdateLibraryItemStatus } from '../../hooks/use-update-library-item-status'

type UpdateLibraryItemStatusPopoverProps = {
  libraryItem: LibraryItem
  status: MediaStatus
  title: string
}

export function UpdateLibraryItemStatusPopover({
  libraryItem,
  status,
  title,
}: UpdateLibraryItemStatusPopoverProps) {
  const {
    handleOpenChange,
    handleSave,
    handleStatusChange,
    isSaving,
    open,
    selectedStatus,
    statusChanged,
  } = useUpdateLibraryItemStatus({ libraryItem, status })

  return (
    <Popover onOpenChange={handleOpenChange} open={open}>
      <PopoverTrigger
        aria-label={`Update status for ${title}`}
        disabled={isSaving}
        render={<Button className="w-fit" type="button" variant="secondary" />}
      >
        Update Status
      </PopoverTrigger>

      <PopoverContent align="start" className="min-w-sm" side="top" sideOffset={3}>
        <PopoverHeader>
          <PopoverTitle>Update Status</PopoverTitle>
          <PopoverDescription className="line-clamp-2">{title}</PopoverDescription>
        </PopoverHeader>

        <Select disabled={isSaving} onValueChange={handleStatusChange} value={selectedStatus}>
          <SelectTrigger aria-label="Library status" className="w-full">
            {MEDIA_STATUS_LABELS[selectedStatus]}
          </SelectTrigger>
          <SelectContent align="start" className="p-1">
            {MEDIA_STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex justify-end">
          <Button disabled={!statusChanged || isSaving} onClick={handleSave} type="button">
            Save
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
