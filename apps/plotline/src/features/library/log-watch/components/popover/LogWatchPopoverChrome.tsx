import { Media } from '@plotline/payload-types'
import { PropsWithChildren } from 'react'

import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
} from '@/components/ui/popover'

import { LogWatchPopoverTrigger } from './LogWatchPopoverTrigger'

type LogWatchPopoverChromeProps = PropsWithChildren<{
  disabled?: boolean
  media: Media
  onPopoverOpenChange: (open: boolean) => void
  popoverOpen: boolean
  /** Visible button text. Omit to keep "Log Watch". */
  triggerLabel?: string
}>

export function LogWatchPopoverChrome({
  children,
  disabled = false,
  media,
  onPopoverOpenChange,
  popoverOpen,
  triggerLabel,
}: LogWatchPopoverChromeProps) {
  // Library cards keep a short visible label and a title-specific accessible name.
  // A custom label (for example "Log S3 E9") is announced with the title.
  const accessibleName = triggerLabel
    ? `${triggerLabel}, ${media.title}`
    : `Log a watch of ${media.title}`

  return (
    <Popover onOpenChange={onPopoverOpenChange} open={popoverOpen}>
      <LogWatchPopoverTrigger
        accessibleName={accessibleName}
        disabled={disabled}
        triggerLabel={triggerLabel}
      />

      <PopoverContent align="start" className="min-w-sm" side="top" sideOffset={3}>
        <PopoverHeader>
          <PopoverTitle>Log Watch</PopoverTitle>
          <PopoverDescription className="line-clamp-2">{media.title}</PopoverDescription>
        </PopoverHeader>
        {children}
      </PopoverContent>
    </Popover>
  )
}
