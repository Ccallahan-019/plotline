'use client'

import type { LibraryItem } from '@plotline/payload-types'

import { useRef } from 'react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { DrawerFooter } from '@/components/ui/drawer'
import { useRemoveLibraryItem } from '@/features/library/library-item/hooks/use-remove-library-item'

type LibraryItemDrawerFooterProps = {
  libraryItem: LibraryItem
  title: string
}

export function LibraryItemDrawerFooter({ libraryItem, title }: LibraryItemDrawerFooterProps) {
  const removeLibraryItem = useRemoveLibraryItem()
  const isRemovingRef = useRef(false)
  const isRemoving = removeLibraryItem.isPending

  const handleRemove = () => {
    if (isRemovingRef.current) {
      return
    }

    isRemovingRef.current = true

    void removeLibraryItem
      .mutateAsync({
        libraryItem,
        libraryItemId: libraryItem.id,
      })
      .catch(() => {
        // The mutation toasts the error and rolls the cache back.
      })
      .finally(() => {
        isRemovingRef.current = false
      })
  }

  return (
    <DrawerFooter className="flex-row justify-end gap-2 border-t">
      <AlertDialog>
        <AlertDialogTrigger
          disabled={isRemoving}
          render={<Button type="button" variant="destructive" />}
        >
          Remove from Library
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently remove {title}?</AlertDialogTitle>
            <AlertDialogDescription>
              Removing {title} permanently deletes this library item and all associated watch
              events. It will also be removed from your watchlists.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isRemoving}
              onClick={handleRemove}
              type="button"
              variant="destructive"
            >
              Remove from Library
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DrawerFooter>
  )
}
