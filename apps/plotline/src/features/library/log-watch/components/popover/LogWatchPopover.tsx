'use client'

import { LibraryItem } from '@plotline/payload-types'
import { ComponentProps } from 'react'

import { Button } from '@/components/ui/button'
import { getMediaFromLibraryItem } from '@/features/library/services/get-media-from-library-item'

import { LogWatchPopoverProvider } from '../../providers/LogWatchPopoverProvider'
import { LogWatchPopoverShell } from './LogWatchPopoverShell'

type LogWatchPopoverProps = {
  libraryItem: LibraryItem
  /** Visible button text. Pass `null` to hide it. Continue watching passes `Log S3 E9` or `Log as watched`. */
  triggerLabel?: null | string
  /** Button size. Omit to use the default button size. */
  triggerSize?: ComponentProps<typeof Button>['size']
}

export function LogWatchPopover({ libraryItem, triggerLabel, triggerSize }: LogWatchPopoverProps) {
  const media = getMediaFromLibraryItem(libraryItem)

  if (!media) {
    return null
  }

  // Keep one Popover root mounted. Swapping Chrome vs Shell on open remounts
  // Base UI Popover, which can fire onOpenChange(false) and close immediately.
  return (
    <LogWatchPopoverProvider triggerLabel={triggerLabel} triggerSize={triggerSize}>
      <LogWatchPopoverShell libraryItem={libraryItem} media={media} />
    </LogWatchPopoverProvider>
  )
}
