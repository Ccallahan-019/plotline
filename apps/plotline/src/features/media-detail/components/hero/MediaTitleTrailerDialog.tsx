'use client'

import { Play } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

import type { MediaTitleTrailer } from '../../types'

import { titleTrailerEmbedUrl } from '../../services/title-trailer-embed-url'

type MediaTitleTrailerDialogProps = {
  trailer: MediaTitleTrailer | null
}

export function MediaTitleTrailerDialog({ trailer }: MediaTitleTrailerDialogProps) {
  const [isEmbedLoaded, setIsEmbedLoaded] = useState(false)
  const [open, setOpen] = useState(false)

  if (trailer == null) return null

  const { key, name } = trailer
  const dialogTitle = name.trim() || 'Trailer'
  const embedUrl = titleTrailerEmbedUrl(key)

  function handleEmbedLoad() {
    setIsEmbedLoaded(true)
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)

    if (nextOpen) {
      setIsEmbedLoaded(false)
    }
  }

  return (
    <Tooltip>
      <Dialog onOpenChange={handleOpenChange} open={open}>
        <TooltipTrigger
          delay={200}
          render={
            <DialogTrigger
              aria-label="Watch Trailer"
              render={<Button size="icon" type="button" variant="outline" />}
            >
              <Play data-icon="inline-start" />
            </DialogTrigger>
          }
        />

        <DialogContent className="p-0 sm:max-w-3xl">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
            {open && (
              <iframe
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="size-full border-0"
                onLoad={handleEmbedLoad}
                referrerPolicy="strict-origin-when-cross-origin"
                src={embedUrl}
                title={dialogTitle}
              />
            )}

            <TrailerLoading isEmbedLoaded={isEmbedLoaded} open={open} />
          </div>
        </DialogContent>
      </Dialog>

      <TooltipContent>Watch Trailer</TooltipContent>
    </Tooltip>
  )
}

function TrailerLoading({ isEmbedLoaded, open }: { isEmbedLoaded: boolean; open: boolean }) {
  if (!open || isEmbedLoaded) return null

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <Spinner aria-label="Loading trailer" className="size-7 text-white" />
    </div>
  )
}
