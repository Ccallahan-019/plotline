'use client'

import { Field, FieldLabel } from '@/components/ui/field'

import { LogWatchFormApi } from '../../hooks/use-log-watch-form'

type LogWatchRewatchFieldProps = {
  disabled?: boolean
  form: LogWatchFormApi
  onCheckedChange?: (checked: boolean) => void
}

export function LogWatchRewatchField({
  disabled = false,
  form,
  onCheckedChange,
}: LogWatchRewatchFieldProps) {
  return (
    <form.AppField name="isRewatch">
      {(field) => (
        <Field data-disabled={disabled} orientation="horizontal">
          <field.CheckboxField disabled={disabled} onCheckedChange={onCheckedChange} />
          <FieldLabel htmlFor={field.name}>Rewatch</FieldLabel>
          <field.FormFieldError />
        </Field>
      )}
    </form.AppField>
  )
}
