import { LibraryItem } from '@plotline/payload-types'
import { MediaStatus } from '@plotline/shared/constants'
import { useState } from 'react'
import { useRef } from 'react'

import { useUpdateLibraryItem } from '../../library-item/hooks/use-update-library-item'

type UseUpdateLibraryItemStatusProps = {
  libraryItem: LibraryItem
  status: MediaStatus
}

/**
 * State and save handler for the drawer's "Update Status" popover.
 *
 * Holds the popover's open flag and the status picked in the select. Opening the popover
 * resets the pick to the item's current `status`, so a pick abandoned earlier never
 * carries over. `handleSave` runs only when the pick differs from `status`, ignores a
 * second click while a save is in flight, and closes the popover once the update succeeds.
 * On failure the popover stays open; `useUpdateLibraryItem` toasts the error and reverts
 * the optimistic status.
 *
 * @param props.libraryItem - Row being edited, used as the cache fallback and for the toast title
 * @param props.status - The item's current status, as shown by the badge
 * @returns `open` / `handleOpenChange` for the popover, `selectedStatus` / `handleStatusChange`
 * for the select, `statusChanged` to enable Save, `isSaving` while the mutation is pending, and
 * `handleSave` to submit the pick
 */
export function useUpdateLibraryItemStatus({
  libraryItem,
  status,
}: UseUpdateLibraryItemStatusProps) {
  const updateLibraryItem = useUpdateLibraryItem()
  const isSavingRef = useRef(false)
  const [open, setOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState(status)
  const isSaving = updateLibraryItem.isPending
  const statusChanged = selectedStatus !== status

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setSelectedStatus(status)
    }

    setOpen(nextOpen)
  }

  const handleSave = () => {
    if (!statusChanged || isSavingRef.current) {
      return
    }

    isSavingRef.current = true

    void updateLibraryItem
      .mutateAsync({
        libraryItem,
        libraryItemId: libraryItem.id,
        status: selectedStatus,
      })
      .then(() => {
        setOpen(false)
      })
      .catch(() => {
        // The mutation toasts the error and rolls the cache back.
      })
      .finally(() => {
        isSavingRef.current = false
      })
  }

  const handleStatusChange = (value: MediaStatus | null) => {
    if (!value) {
      return
    }

    setSelectedStatus(value)
  }

  return {
    handleOpenChange,
    handleSave,
    handleStatusChange,
    isSaving,
    open,
    selectedStatus,
    statusChanged,
  }
}
