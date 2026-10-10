'use client'

import { Plus } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ShowIf } from '@/components/utils/ShowIf'

import type { TitleSearchAddInput } from '../../hooks/use-title-search-dialog'
import type { TitleSearchDestination } from '../../services/classify-title-search-row'

import { useTitleSearchDialog } from '../../hooks/use-title-search-dialog'
import { TitleSearchMediaTypeToggle } from './TitleSearchMediaTypeToggle'
import { TitleSearchQueryField } from './TitleSearchQueryField'
import { TitleSearchResultList } from './TitleSearchResultList'
import { TitleSearchStatusField } from './TitleSearchStatusField'

export type { TitleSearchAddInput, TitleSearchDestination }

type TitleSearchDialogProps = {
  description: string
  destination: TitleSearchDestination
  onAdd: (input: TitleSearchAddInput) => Promise<unknown>
  /** `movie:550` style keys already on the current watchlist. */
  onListKeys?: ReadonlySet<string>
  /**
   * When set with `open`, the parent owns visibility. Use this when a trigger
   * can unmount while the dialog should stay open.
   */
  onOpenChange?: (open: boolean) => void
  open?: boolean
  title: string
  triggerLabel?: string
}

// Shared TMDB search dialog. Destination wrappers choose where the title goes and how it is saved.
export function TitleSearchDialog({
  description,
  destination,
  onAdd,
  onListKeys,
  onOpenChange,
  open: openProp,
  title,
  triggerLabel = 'Add Title',
}: TitleSearchDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const open = openProp ?? uncontrolledOpen
  const search = useTitleSearchDialog({
    destination,
    onAdd,
    onListKeys,
    open,
  })
  const actionLabel = destination === 'library' ? 'Add to Library' : 'Add to List'
  const submitLabel = search.isSubmitting
    ? 'Adding...'
    : search.libraryLookupPending && search.selectedKey != null
      ? 'Checking library...'
      : actionLabel

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && search.isSubmitting) {
      return
    }

    if (!nextOpen) {
      search.reset()
    }

    if (openProp === undefined) {
      setUncontrolledOpen(nextOpen)
    }

    onOpenChange?.(nextOpen)
  }

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    void search.submit()
  }

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogTrigger render={<Button type="button" variant="outline" />}>
        <Plus data-icon="inline-start" />
        {triggerLabel}
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="pr-8">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <TitleSearchQueryField
            disabled={search.isSubmitting}
            isBusy={search.isSearchBusy}
            onQueryChange={search.setQuery}
            query={search.query}
          />

          <TitleSearchMediaTypeToggle
            disabled={search.isSubmitting}
            mediaType={search.mediaType}
            onMediaTypeChange={search.setMediaType}
          />

          <TitleSearchResultList
            canSearch={search.canSearch}
            isAwaitingResults={search.isAwaitingResults}
            isSearchError={search.isSearchError}
            onSelect={search.selectRow}
            rows={search.rows}
            selectedKey={search.selectedKey}
            selectionDisabled={search.isSubmitting}
          />

          <ShowIf condition={search.showStatus}>
            <TitleSearchStatusField
              disabled={search.isSubmitting}
              onStatusChange={search.setStatus}
              status={search.status}
            />
          </ShowIf>

          <DialogFooter>
            <Button disabled={!search.canSubmit} type="submit">
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
