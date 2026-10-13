'use client'

import { LibraryItem } from '@plotline/payload-types'
import { useState } from 'react'

import { getMediaFromLibraryItem } from '@/features/library/services/get-media-from-library-item'

import { LogWatchPopoverShell } from './LogWatchPopoverShell'

type LogWatchPopoverProps = {
  libraryItem: LibraryItem
}

export function LogWatchPopover({ libraryItem }: LogWatchPopoverProps) {
  const media = getMediaFromLibraryItem(libraryItem)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  if (!media) {
    return null
  }

  // Keep one Popover root mounted. Swapping Chrome vs Shell on open remounts
  // Base UI Popover, which can fire onOpenChange(false) and close immediately.
  return (
    <LogWatchPopoverShell
      dialogOpen={dialogOpen}
      libraryItem={libraryItem}
      media={media}
      onDialogOpenChange={setDialogOpen}
      onPopoverOpenChange={setPopoverOpen}
      popoverOpen={popoverOpen}
    />
  )
}
