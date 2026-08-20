'use client'

import type { MediaStatus } from '@plotline/shared/constants'

import { Field, FieldContent, FieldLabel } from '@/components/ui/field'
import { MEDIA_STATUS_OPTIONS } from '@/features/library/constants/media-status-options'

import type { AddToLibraryFormApi } from '../hooks/use-add-to-library-form'

const ADD_TO_LIBRARY_STATUS_ITEMS = MEDIA_STATUS_OPTIONS.filter(
  (option) => option.value !== 'dropped',
)

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
              items={ADD_TO_LIBRARY_STATUS_ITEMS}
              placeholder="Select status"
            />
          </FieldContent>
          <field.FormFieldError />
        </Field>
      )}
    </form.AppField>
  )
}
