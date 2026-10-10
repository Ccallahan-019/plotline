'use client'

import type { MediaStatus } from '@plotline/shared/constants'

import { Field, FieldContent, FieldLabel } from '@/components/ui/field'
import { MEDIA_STATUS_OPTIONS_FOR_ADD } from '@/features/library/constants/media-status-options'

import type { AddToLibraryFormApi } from '../hooks/use-add-to-library-form'

type AddToLibraryStatusFieldProps = {
  disabled?: boolean
  form: AddToLibraryFormApi
}

export function AddToLibraryStatusField({
  disabled = false,
  form,
}: AddToLibraryStatusFieldProps) {
  return (
    <form.AppField name="status">
      {(field) => (
        <Field data-disabled={disabled}>
          <FieldLabel htmlFor={field.name}>Status</FieldLabel>
          <FieldContent>
            <field.SelectField<MediaStatus>
              disabled={disabled}
              items={MEDIA_STATUS_OPTIONS_FOR_ADD}
              placeholder="Select status"
            />
          </FieldContent>
          <field.FormFieldError />
        </Field>
      )}
    </form.AppField>
  )
}
