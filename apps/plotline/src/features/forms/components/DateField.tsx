'use client'

import { DatePicker, type DatePickerProps } from '@/components/ui/date-picker'

import { useFieldContext } from '../contexts/form-contexts'

type DateFieldProps = {
  allowEmpty?: boolean
  onChange?: DatePickerProps['onChange']
} & Omit<DatePickerProps, 'onChange' | 'value'>

export function DateField({ allowEmpty = false, id, onChange, ...props }: DateFieldProps) {
  const field = useFieldContext<Date | undefined>()
  const isInvalid = field.state.meta.errors.length > 0
  const inputId = id ?? field.name

  const handleChange = (date: Date | undefined) => {
    if (date == null && !allowEmpty) {
      return
    }

    field.handleChange(date)
    onChange?.(date)
  }

  return (
    <DatePicker
      aria-invalid={isInvalid}
      id={inputId}
      onChange={handleChange}
      value={field.state.value}
      {...props}
    />
  )
}
