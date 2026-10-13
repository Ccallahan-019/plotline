'use client'

import { Switch } from '@/components/ui/switch'

import { useFieldContext } from '../contexts/form-contexts'

type SwitchFieldProps = {
  onCheckedChange?: (checked: boolean) => void
} & Omit<React.ComponentProps<typeof Switch>, 'checked' | 'onCheckedChange'>

export function SwitchField({ id, onBlur, onCheckedChange, ...props }: SwitchFieldProps) {
  const field = useFieldContext<boolean>()
  const isInvalid = field.state.meta.errors.length > 0
  const inputId = id ?? field.name

  return (
    <Switch
      aria-invalid={isInvalid}
      checked={field.state.value}
      id={inputId}
      name={field.name}
      onBlur={(event) => {
        field.handleBlur()
        onBlur?.(event)
      }}
      onCheckedChange={(checked) => {
        field.handleChange(checked)
        onCheckedChange?.(checked)
      }}
      {...props}
    />
  )
}
