'use client'

import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { ShowIf } from '@/components/utils/ShowIf'

type MinMaxNumberFilterFieldProps = {
  error?: null | string
  label: string
  max: number
  maxPlaceholder?: string
  maxValue?: number
  min: number
  minPlaceholder?: string
  minValue?: number
  onMaxChange: (value: number | undefined) => void
  onMinChange: (value: number | undefined) => void
  step?: number
}

export function MinMaxNumberFilterField({
  error,
  label,
  max,
  maxPlaceholder = 'Max',
  maxValue,
  min,
  minPlaceholder = 'Min',
  minValue,
  onMaxChange,
  onMinChange,
  step = 1,
}: MinMaxNumberFilterFieldProps) {
  const handleMinChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    onMinChange(value === '' ? undefined : Number(value))
  }

  const handleMaxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    onMaxChange(value === '' ? undefined : Number(value))
  }

  return (
    <Field>
      <FieldLabel className="font-semibold mb-2">{label}</FieldLabel>
      <FieldGroup className="grid grid-cols-2 gap-3">
        <Field>
          <Input
            max={max}
            min={min}
            onChange={handleMinChange}
            placeholder={minPlaceholder}
            step={step}
            type="number"
            value={minValue ?? ''}
          />
        </Field>
        <Field>
          <Input
            max={max}
            min={min}
            onChange={handleMaxChange}
            placeholder={maxPlaceholder}
            step={step}
            type="number"
            value={maxValue ?? ''}
          />
        </Field>
      </FieldGroup>

      <ShowIf condition={!!error}>
        <FieldDescription className="text-destructive">{error}</FieldDescription>
      </ShowIf>
    </Field>
  )
}
