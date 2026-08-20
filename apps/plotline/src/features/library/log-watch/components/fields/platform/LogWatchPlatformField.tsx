'use client'

import { Field, FieldContent } from '@/components/ui/field'

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
          <FieldContent className="gap-2">
            <LogWatchPlatformFieldContent disabled={disabled} layout={layout} />
          </FieldContent>
          <field.FormFieldError />
        </Field>
      )}
    </form.AppField>
  )
}
