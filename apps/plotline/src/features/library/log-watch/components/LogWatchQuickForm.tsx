'use client'

import type { Media } from '@plotline/payload-types'
import type { SubmitEvent } from 'react'

import { Button } from '@/components/ui/button'

import type { LogWatchFormApi } from '../hooks/use-log-watch-form'

import { LogWatchFormFields } from './fields/LogWatchFormFields'

type LogWatchQuickFormProps = {
  form: LogWatchFormApi
  isSubmitting: boolean
  media: Media
  onMoreOptions: () => void
}

export function LogWatchQuickForm({
  form,
  isSubmitting,
  media,
  onMoreOptions,
}: LogWatchQuickFormProps) {
  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    void form.handleSubmit()
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <LogWatchFormFields
        form={form}
        isSubmitting={isSubmitting}
        media={media}
        platformLayout="compact"
      />

      <div className="flex flex-col gap-2">
        <form.AppForm>
          <form.SubmitButton className="w-full" loadingLabel="Logging…">
            Log Watch
          </form.SubmitButton>
        </form.AppForm>

        <Button disabled={isSubmitting} onClick={onMoreOptions} type="button" variant="ghost">
          More Options…
        </Button>
      </div>
    </form>
  )
}
