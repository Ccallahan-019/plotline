'use client'

import type { MediaStatus } from '@plotline/shared/constants'

import { useId } from 'react'

import { Field, FieldContent, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'
import { MEDIA_STATUS_OPTIONS_FOR_ADD } from '@/features/library/constants/media-status-options'

type TitleSearchStatusFieldProps = {
  disabled?: boolean
  onStatusChange: (status: MediaStatus) => void
  status: MediaStatus
}

export function TitleSearchStatusField({
  disabled = false,
  onStatusChange,
  status,
}: TitleSearchStatusFieldProps) {
  const fieldId = useId()
  const selected = MEDIA_STATUS_OPTIONS_FOR_ADD.find((option) => option.value === status)

  const handleValueChange = (nextValue: unknown) => {
    const match = MEDIA_STATUS_OPTIONS_FOR_ADD.find((option) => option.value === nextValue)

    if (match == null) {
      return
    }

    onStatusChange(match.value)
  }

  return (
    <Field data-disabled={disabled}>
      <FieldLabel htmlFor={fieldId}>Status</FieldLabel>
      <FieldContent>
        <Select disabled={disabled} onValueChange={handleValueChange} value={status}>
          <SelectTrigger className="w-full" id={fieldId}>
            <span className="min-w-0 flex-1 truncate text-left">
              {selected?.label ?? 'Select status'}
            </span>
          </SelectTrigger>
          <SelectContent align="start" className="min-w-fit">
            <SelectGroup>
              {MEDIA_STATUS_OPTIONS_FOR_ADD.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </FieldContent>
    </Field>
  )
}
