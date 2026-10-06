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

type NumberFieldProps = Omit<React.ComponentProps<typeof Input>, 'defaultValue' | 'type' | 'value'>

export function NumberField({ id, onBlur, onChange, ...props }: NumberFieldProps) {
  const field = useFieldContext<null | number>()
  const isInvalid = field.state.meta.errors.length > 0
  const inputId = id ?? field.name
  const hasValue = field.state.value != null

  const handleClear = () => {
    field.handleChange(null)
    onChange?.({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>)
  }

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    field.handleBlur()
    onBlur?.(event)
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value

    if (raw === '') {
      field.handleChange(null)
    } else {
      const nextValue = Number(raw)

      if (!Number.isNaN(nextValue)) {
        field.handleChange(nextValue)
      }
    }

    onChange?.(event)
  }

  return (
    <InputGroup>
      <InputGroupInput
        aria-invalid={isInvalid}
        id={inputId}
        name={field.name}
        onBlur={handleBlur}
        onChange={handleChange}
        type="number"
        value={field.state.value ?? ''}
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
