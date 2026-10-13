'use client'

import { X } from 'lucide-react'

import { Input } from '@/components/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import { ShowIf } from '@/components/utils/ShowIf'

import { useFieldContext } from '../contexts/form-contexts'

type TextFieldProps = Omit<React.ComponentProps<typeof Input>, 'defaultValue' | 'value'>

export function TextField({ id, onBlur, onChange, ...props }: TextFieldProps) {
  const field = useFieldContext<string>()
  const isInvalid = field.state.meta.errors.length > 0
  const inputId = id ?? field.name

  const handleClear = () => {
    field.handleChange('')
    onChange?.({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>)
  }

  const hasValue = field.state.value.length > 0

  return (
    <InputGroup>
      <InputGroupInput
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
      <ShowIf condition={hasValue}>
        <InputGroupAddon align="inline-end">
          <InputGroupButton onClick={handleClear} size="icon-xs" type="button" variant="ghost">
            <X />
          </InputGroupButton>
        </InputGroupAddon>
      </ShowIf>
    </InputGroup>
  )
}
