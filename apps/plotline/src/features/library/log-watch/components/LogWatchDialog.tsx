'use client'

import type { Media } from '@plotline/payload-types'
import type { FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ShowIf } from '@/components/utils/ShowIf'

import type { LogWatchFormApi } from '../hooks/use-log-watch-form'

import { LogWatchFormFields } from './fields/LogWatchFormFields'

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
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void form.handleSubmit()
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-md">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Log Watch</DialogTitle>
            <DialogDescription className="line-clamp-2">{media.title}</DialogDescription>
          </DialogHeader>

          <ShowIf condition={open}>
            <LogWatchFormFields
              form={form}
              isSubmitting={isSubmitting}
              media={media}
              platformLayout="expanded"
            />
          </ShowIf>

          <DialogFooter>
            <Button
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <form.AppForm>
              <form.SubmitButton loadingLabel="Logging…">Log Watch</form.SubmitButton>
            </form.AppForm>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
