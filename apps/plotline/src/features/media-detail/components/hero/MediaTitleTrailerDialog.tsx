'use client'

import { Play } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import type { MediaTitleTrailer } from '../../types'

import { titleTrailerEmbedUrl } from '../../services/title-trailer-embed-url'

type MediaTitleTrailerDialogProps = {
  trailer: MediaTitleTrailer | null
}

export function MediaTitleTrailerDialog({ trailer }: MediaTitleTrailerDialogProps) {
  const [open, setOpen] = useState(false)

  if (trailer == null) return null

  const { key, name } = trailer
  const dialogTitle = name.trim() || 'Trailer'
  const embedUrl = titleTrailerEmbedUrl(key)

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
  }

  return (
    <Tooltip>
      <Dialog onOpenChange={handleOpenChange} open={open}>
        <TooltipTrigger
          delay={200}
          render={
            <DialogTrigger render={<Button size="icon" type="button" variant="outline" />}>
              <Play data-icon="inline-start" />
            </DialogTrigger>
          }
        />

        <DialogContent className="sm:max-w-3xl p-0">
          <div className="aspect-video inset-0 w-full overflow-hidden rounded-xl bg-black">
            <iframe
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="size-full border-0"
              referrerPolicy="strict-origin-when-cross-origin"
              src={embedUrl}
              title={dialogTitle}
            />
          </div>
        </DialogContent>
      </Dialog>

      <TooltipContent>Watch Trailer</TooltipContent>
    </Tooltip>
  )
}
