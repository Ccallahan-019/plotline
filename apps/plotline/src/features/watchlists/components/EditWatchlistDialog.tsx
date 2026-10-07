'use client'

import type { Watchlist } from '@plotline/payload-types'

import { PencilLine } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

import { useEditWatchlistForm } from '../hooks/use-edit-watchlist-form'
import { toEditWatchlistFormValues } from '../services/edit-watchlist-form'
import { EditWatchlistForm } from './EditWatchlistForm'

type EditWatchlistDialogProps = {
  slug: string
  watchlist: Watchlist
}

export function EditWatchlistDialog({ slug, watchlist }: EditWatchlistDialogProps) {
  const [open, setOpen] = useState(false)
  const { form, isSubmitting } = useEditWatchlistForm({
    onSuccess: () => setOpen(false),
    slug,
    watchlist,
  })

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isSubmitting) {
      return
    }

    if (nextOpen) {
      form.reset(toEditWatchlistFormValues(watchlist))
    }

    setOpen(nextOpen)
  }

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogTrigger render={<Button type="button" variant="outline" />}>
        <PencilLine data-icon="inline-start" />
        Edit
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit watchlist</DialogTitle>
          <DialogDescription>
            Change the name, description, and who can see this list.
          </DialogDescription>
        </DialogHeader>

        <EditWatchlistForm
          form={form}
          isSubmitting={isSubmitting}
          onCancel={() => handleOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
