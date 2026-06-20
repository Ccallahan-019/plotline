'use client'

import type { LibraryItem } from '@plotline/payload-types'

import { Bookmark, BookmarkPlus } from 'lucide-react'

import type { MediaDisplay } from '@/features/media-grid/types'

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
import { ShowIf } from '@/components/utils/ShowIf'
import { useOpenState } from '@/providers/OpenStateProvider'

import { AddToLibraryForm } from './AddToLibraryForm'

type AddToLibraryPopoverProps = {
  existingLibraryItem?: LibraryItem
  media: MediaDisplay
}

export function AddToLibraryPopover({ existingLibraryItem, media }: AddToLibraryPopoverProps) {
  const { isOpen, setIsOpen } = useOpenState()

  const handleOpenChange = (nextOpen: boolean) => {
    setIsOpen(nextOpen)
  }

  const handleSuccess = () => {
    setIsOpen(false)
  }

  const triggerContent = existingLibraryItem ? <Bookmark fill="currentColor" /> : <BookmarkPlus />

  const popoverTitle = existingLibraryItem ? 'Add to Watchlists' : 'Add to Library'

  return (
    <Tooltip>
      <Popover onOpenChange={handleOpenChange} open={isOpen}>
        <TooltipTrigger
          delay={200}
          render={
            <PopoverTrigger
              aria-label={`Add ${media.title} to library`}
              render={
                <Button className="shadow-sm backdrop-blur-sm" size="icon" variant="secondary" />
              }
            >
              {triggerContent}
            </PopoverTrigger>
          }
        />

        <PopoverContent align="start" className="w-80" side="top" sideOffset={3}>
          <PopoverHeader>
            <PopoverTitle>{popoverTitle}</PopoverTitle>
            <PopoverDescription className="line-clamp-2">{media.title}</PopoverDescription>
          </PopoverHeader>

          <ShowIf condition={isOpen}>
            <AddToLibraryForm
              existingLibraryItem={existingLibraryItem}
              media={media}
              onSuccess={handleSuccess}
            />
          </ShowIf>
        </PopoverContent>
      </Popover>

      <TooltipContent>{popoverTitle}</TooltipContent>
    </Tooltip>
  )
}
