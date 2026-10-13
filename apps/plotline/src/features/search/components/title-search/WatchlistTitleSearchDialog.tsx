'use client'

import { useAddToList } from '@/features/library/add-to-list/hooks/use-add-to-list'

import type { TitleSearchAddInput } from '../../hooks/use-title-search-dialog'

import { TitleSearchDialog } from './TitleSearchDialog'

type WatchlistTitleSearchDialogProps = {
  /** `movie:550` style keys already on this watchlist. */
  onListKeys: ReadonlySet<string>
  /** Parent-owned visibility so the dialog can outlive an empty-state trigger. */
  onOpenChange: (open: boolean) => void
  open: boolean
  slug: string
  triggerLabel?: string
}

// Watchlist page entry for the shared title dialog. Adds a membership on this list.
export function WatchlistTitleSearchDialog({
  onListKeys,
  onOpenChange,
  open,
  slug,
  triggerLabel,
}: WatchlistTitleSearchDialogProps) {
  const addToList = useAddToList()

  const handleAdd = (input: TitleSearchAddInput) => {
    return addToList.mutateAsync({
      ...input.media,
      watchlistSlug: slug,
      ...(input.status != null ? { status: input.status } : {}),
    })
  }

  return (
    <TitleSearchDialog
      description="Search for a movie or series and add it to this list."
      destination="watchlist"
      onAdd={handleAdd}
      onListKeys={onListKeys}
      onOpenChange={onOpenChange}
      open={open}
      title="Add to List"
      triggerLabel={triggerLabel}
    />
  )
}
