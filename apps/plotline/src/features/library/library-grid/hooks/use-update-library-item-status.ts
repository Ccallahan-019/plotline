import { LibraryItem } from '@plotline/payload-types'
import { MediaStatus } from '@plotline/shared/constants'
import { useState } from 'react'
import { useRef } from 'react'

import { useUpdateLibraryItem } from '../../library-item/hooks/use-update-library-item'

type UseUpdateLibraryItemStatusProps = {
  libraryItem: LibraryItem
  status: MediaStatus
}

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
