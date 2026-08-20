'use client'

import { Checkbox } from '@/components/ui/checkbox'

import { useFieldContext } from '../contexts/form-contexts'

type CheckboxFieldProps = {
  onCheckedChange?: (checked: boolean) => void
} & Omit<React.ComponentProps<typeof Checkbox>, 'checked' | 'onCheckedChange'>

export function CheckboxField({ id, onBlur, onCheckedChange, ...props }: CheckboxFieldProps) {
  const field = useFieldContext<boolean>()
  const isInvalid = field.state.meta.errors.length > 0
  const inputId = id ?? field.name

  return (
    <Checkbox
      aria-invalid={isInvalid}
      checked={field.state.value}
      id={inputId}
      name={field.name}
      onBlur={(event) => {
        field.handleBlur()
        onBlur?.(event)
      }}
      onCheckedChange={(checked) => {
        const nextValue = checked === true
        field.handleChange(nextValue)
        onCheckedChange?.(nextValue)
      }}
      {...props}
    />
  )
}
