'use client'

import type { Media } from '@plotline/payload-types'
import type { SubmitEvent } from 'react'

import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'

import type { LogWatchFormApi } from '../hooks/use-log-watch-form'

import { LogWatchFormFields } from './fields/LogWatchFormFields'

type LogWatchFullFormProps = {
  form: LogWatchFormApi
  isSubmitting: boolean
  media: Media
  onCancel: () => void
}

export function LogWatchFullForm({ form, isSubmitting, media, onCancel }: LogWatchFullFormProps) {
  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    void form.handleSubmit()
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <ScrollArea className="h-[60vh] pr-4">
        <LogWatchFormFields
          episodeMode="multi"
          form={form}
          isSubmitting={isSubmitting}
          media={media}
          platformLayout="expanded"
        />
      </ScrollArea>

      <DialogFooter>
        <Button disabled={isSubmitting} onClick={onCancel} type="button" variant="outline">
          Cancel
        </Button>
        <form.AppForm>
          <form.SubmitButton loadingLabel="Logging…">Log Watch</form.SubmitButton>
        </form.AppForm>
      </DialogFooter>
    </form>
  )
}
