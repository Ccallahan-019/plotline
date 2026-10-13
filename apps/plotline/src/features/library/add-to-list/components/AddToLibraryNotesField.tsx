'use client'

import { Field, FieldContent, FieldLabel } from '@/components/ui/field'

import type { AddToLibraryFormApi } from '../hooks/use-add-to-library-form'

type AddToLibraryNotesFieldProps = {
  disabled?: boolean
  form: AddToLibraryFormApi
}

export function AddToLibraryNotesField({ disabled = false, form }: AddToLibraryNotesFieldProps) {
  return (
    <form.AppField name="note">
      {(field) => (
        <Field data-disabled={disabled}>
          <FieldLabel htmlFor={field.name}>Notes</FieldLabel>
          <FieldContent>
            <field.TextAreaField
              disabled={disabled}
              placeholder="Optional note for the selected lists"
              rows={3}
            />
          </FieldContent>
          <field.FormFieldError />
        </Field>
      )}
    </form.AppField>
  )
}
