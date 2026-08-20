import { Field, FieldContent, FieldLabel } from '@/components/ui/field'

import { LogWatchFormApi } from '../../../hooks/use-log-watch-form'

type PlatformOtherFieldProps = {
  disabled?: boolean
  form: LogWatchFormApi
}

export function PlatformOtherField({ disabled = false, form }: PlatformOtherFieldProps) {
  return (
    <form.AppField name="platformOther">
      {(field) => (
        <Field data-disabled={disabled}>
          <FieldLabel>Other Platform</FieldLabel>
          <FieldContent>
            <field.TextField />
          </FieldContent>
          <field.FormFieldError />
        </Field>
      )}
    </form.AppField>
  )
}
