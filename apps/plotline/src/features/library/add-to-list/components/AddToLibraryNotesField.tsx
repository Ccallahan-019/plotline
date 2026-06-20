'use client'

import { Field, FieldContent, FieldError, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'

type AddToLibraryNotesFieldProps = {
  disabled?: boolean
  error?: string
  onChange: (note: string) => void
  value: string
}

export function AddToLibraryNotesField({
  disabled = false,
  error,
  onChange,
  value,
}: AddToLibraryNotesFieldProps) {
  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value)
  }

  return (
    <Field data-disabled={disabled}>
      <FieldLabel htmlFor="add-to-library-notes">Notes</FieldLabel>
      <FieldContent>
        <Textarea
          aria-invalid={!!error}
          disabled={disabled}
          id="add-to-library-notes"
          onChange={handleChange}
          placeholder="Optional note for the selected lists"
          rows={3}
          value={value}
        />
        <FieldError>{error}</FieldError>
      </FieldContent>
    </Field>
  )
}
