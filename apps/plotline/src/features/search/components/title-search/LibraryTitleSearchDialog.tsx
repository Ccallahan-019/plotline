'use client'

import { useCreateLibraryItem } from '@/features/library/library-item/hooks/use-create-library-item'

import type { TitleSearchAddInput } from '../../hooks/use-title-search-dialog'

import { TitleSearchDialog } from './TitleSearchDialog'

type LibraryTitleSearchDialogProps = {
  /** Parent-owned visibility so the dialog can outlive an empty-state trigger. */
  onOpenChange: (open: boolean) => void
  open: boolean
  triggerLabel?: string
}

// Library page entry for the shared title dialog. Creates a library row and leaves list membership alone.
export function LibraryTitleSearchDialog({
  onOpenChange,
  open,
  triggerLabel,
}: LibraryTitleSearchDialogProps) {
  const createLibraryItem = useCreateLibraryItem()

  const handleAdd = (input: TitleSearchAddInput) => {
    return createLibraryItem.mutateAsync({
      ...input.media,
      ...(input.status != null ? { status: input.status } : {}),
    })
  }

  return (
    <TitleSearchDialog
      description="Search for a movie or series and add it to your library."
      destination="library"
      onAdd={handleAdd}
      onOpenChange={onOpenChange}
      open={open}
      title="Add to Library"
      triggerLabel={triggerLabel}
    />
  )
}
