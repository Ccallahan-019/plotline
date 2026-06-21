'use client'

import type { LibraryItem } from '@plotline/payload-types'

import { Ellipsis } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { getMediaFromLibraryItem } from '@/features/library/services/get-media-from-library-item'

import { LibraryItemDrawerContent } from './LibraryItemDrawerContent'
import { LibraryItemDrawerFooter } from './LibraryItemDrawerFooter'

type LibraryItemDrawerProps = {
  item: LibraryItem
}

export function LibraryItemDrawer({ item }: LibraryItemDrawerProps) {
  const media = getMediaFromLibraryItem(item)

  if (!media) {
    return null
  }

  const title = typeof item.media === 'object' ? item.media.title : 'Library item'

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          aria-label={`View details for ${title}`}
          size="icon"
          type="button"
          variant="secondary"
        >
          <Ellipsis />
        </Button>
      </DrawerTrigger>

      <DrawerContent>
        <DrawerHeader className="items-start border-b">
          <DrawerTitle>Library Item: {title}</DrawerTitle>
          <DrawerDescription className="sr-only">
            Library item details and actions
          </DrawerDescription>
        </DrawerHeader>

        <LibraryItemDrawerContent item={item} />

        <LibraryItemDrawerFooter media={media} />
      </DrawerContent>
    </Drawer>
  )
}
