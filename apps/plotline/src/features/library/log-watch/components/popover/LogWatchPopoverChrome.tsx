import { Media } from '@plotline/payload-types'
import { Check } from 'lucide-react'
import { PropsWithChildren } from 'react'

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

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
  return (
    <Tooltip>
      <Popover onOpenChange={onPopoverOpenChange} open={popoverOpen}>
        <TooltipTrigger
          delay={200}
          render={
            <PopoverTrigger
              aria-label={`Log a watch of ${media.title}`}
              disabled={disabled}
              render={<Button />}
            >
              <Check />
              Log Watch
            </PopoverTrigger>
          }
        />

        <PopoverContent align="start" className="w-80" side="top" sideOffset={3}>
          <PopoverHeader>
            <PopoverTitle>Log Watch</PopoverTitle>
            <PopoverDescription className="line-clamp-2">{media.title}</PopoverDescription>
          </PopoverHeader>
          {children}
        </PopoverContent>
      </Popover>

      <TooltipContent>Log Watch</TooltipContent>
    </Tooltip>
  )
}
