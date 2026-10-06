import { startOfDay } from 'date-fns'

import { Field, FieldContent, FieldLabel } from '@/components/ui/field'

import { LogWatchFormApi } from '../../../hooks/use-log-watch-form'
import { whenPresetForWatchedAt } from '../../../services/log-watch-form'

type LogWatchWhenPopoverFieldProps = {
  disabled?: boolean
  form: LogWatchFormApi
}

export function LogWatchWhenPopoverField({
  disabled = false,
  form,
}: LogWatchWhenPopoverFieldProps) {
  return (
    <form.AppField
      listeners={{
        onChange: (value) => {
          if (value.value == null) {
            return
          }

          form.setFieldValue('whenPreset', whenPresetForWatchedAt(value.value), {
            dontRunListeners: true,
          })
        },
      }}
      name="watchedAt"
    >
      {(field) => (
        <Field className="items-center!" data-disabled={disabled} orientation="horizontal">
          <FieldLabel className="max-w-20">When</FieldLabel>
          <FieldContent>
            <field.DateField
              disabled={disabled}
              maxDate={startOfDay(new Date())}
              placeholder="Pick a date"
            />
          </FieldContent>
          <field.FormFieldError />
        </Field>
      )}
    </form.AppField>
  )
}
