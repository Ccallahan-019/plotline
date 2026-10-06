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
}>

export function LogWatchPopoverChrome({
  children,
  disabled = false,
  media,
  onPopoverOpenChange,
  popoverOpen,
}: LogWatchPopoverChromeProps) {
  const triggerLabel = `Log a watch of ${media.title}`

  return (
    <Popover onOpenChange={onPopoverOpenChange} open={popoverOpen}>
      <LogWatchPopoverTrigger disabled={disabled} triggerLabel={triggerLabel} />

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
