'use client'

import type { Media } from '@plotline/payload-types'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import type { LogWatchFormApi } from '../hooks/use-log-watch-form'

import { LogWatchFullForm } from './LogWatchFullForm'

type LogWatchDialogProps = {
  form: LogWatchFormApi
  isSubmitting: boolean
  media: Media
  onOpenChange: (open: boolean) => void
  open: boolean
}

export function LogWatchDialog({
  form,
  isSubmitting,
  media,
  onOpenChange,
  open,
}: LogWatchDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Log Watch</DialogTitle>
          <DialogDescription className="line-clamp-2">{media.title}</DialogDescription>
        </DialogHeader>

        <LogWatchFullForm
          form={form}
          isSubmitting={isSubmitting}
          media={media}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
