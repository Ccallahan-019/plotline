'use client'

import { Textarea } from '@/components/ui/textarea'

import { useFieldContext } from '../contexts/form-contexts'

type TextAreaFieldProps = Omit<React.ComponentProps<typeof Textarea>, 'defaultValue' | 'value'>

export function TextAreaField({ id, onBlur, onChange, ...props }: TextAreaFieldProps) {
  const field = useFieldContext<string>()
  const isInvalid = field.state.meta.errors.length > 0
  const inputId = id ?? field.name

  return (
    <Textarea
      aria-invalid={isInvalid}
      id={inputId}
      name={field.name}
      onBlur={(event) => {
        field.handleBlur()
        onBlur?.(event)
      }}
      onChange={(event) => {
        field.handleChange(event.target.value)
        onChange?.(event)
      }}
      value={field.state.value}
      {...props}
    />
  )
}
