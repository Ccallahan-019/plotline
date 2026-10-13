'use client'

import { TvMinimal } from 'lucide-react'

import { Field, FieldContent, FieldLabel } from '@/components/ui/field'
import { ShowIf } from '@/components/utils/ShowIf'

import { LogWatchFormApi } from '../../../hooks/use-log-watch-form'
import { LogWatchPlatformFieldContent } from './LogWatchPlatformFieldContent'

type LogWatchPlatformFieldProps = {
  disabled?: boolean
  form: LogWatchFormApi
  layout?: 'compact' | 'expanded'
}

export function LogWatchPlatformField({
  disabled = false,
  form,
  layout = 'compact',
}: LogWatchPlatformFieldProps) {
  return (
    <form.AppField name="platform">
      {(field) => (
        <Field data-disabled={disabled}>
          <ShowIf condition={layout === 'expanded'}>
            <div className="flex items-center gap-2 mb-1">
              <TvMinimal className="size-3 text-muted-foreground" />
              <FieldLabel className="leading-none">Where did you watch this?</FieldLabel>
            </div>
          </ShowIf>

          <FieldContent className="gap-2">
            <LogWatchPlatformFieldContent disabled={disabled} layout={layout} />
          </FieldContent>
          <field.FormFieldError />
        </Field>
      )}
    </form.AppField>
  )
}
