import { Media } from '@plotline/payload-types'
import { PropsWithChildren } from 'react'

import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
} from '@/components/ui/popover'

import { useLogWatchPopover } from '../../providers/LogWatchPopoverProvider'
import { logWatchTriggerAccessibleName } from '../../services/log-watch-trigger'
import { LogWatchPopoverTrigger } from './LogWatchPopoverTrigger'

type LogWatchPopoverChromeProps = PropsWithChildren<{
  disabled?: boolean
  media: Media
}>

export function LogWatchPopoverChrome({
  children,
  disabled = false,
  media,
}: LogWatchPopoverChromeProps) {
  const { isDialogOpen, isPopoverOpen, setPopoverOpen, triggerLabel } = useLogWatchPopover()

  function handlePopoverOpenChange(nextOpen: boolean) {
    if (isDialogOpen) {
      return
    }

    setPopoverOpen(nextOpen)
  }

  // Pass the unset label through. The visible default is "Log Watch", but the
  // accessible name names the title so each library card stays distinct.
  const accessibleName = logWatchTriggerAccessibleName(media.title, triggerLabel)

  return (
    <Popover onOpenChange={handlePopoverOpenChange} open={isPopoverOpen}>
      <LogWatchPopoverTrigger accessibleName={accessibleName} disabled={disabled} />

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
