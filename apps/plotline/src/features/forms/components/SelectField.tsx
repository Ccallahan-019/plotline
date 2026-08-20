'use client'

import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { cn } from '@/lib/utils'

import { useFieldContext } from '../contexts/form-contexts'

export type SelectFieldItem<T extends number | string = string> = {
  disabled?: boolean
  label: string
  value: T
}

type SelectFieldProps<T extends number | string> = {
  allowEmpty?: boolean
  'aria-label'?: string
  className?: string
  id?: string
  items: ReadonlyArray<SelectFieldItem<T>>
  onValueChange?: (value: T | undefined) => void
  placeholder?: string
  renderItem?: (item: SelectFieldItem<T>) => React.ReactNode
} & Omit<
  React.ComponentProps<typeof Select>,
  'children' | 'defaultValue' | 'items' | 'multiple' | 'onValueChange' | 'value'
>

export function SelectField<T extends number | string>({
  allowEmpty = false,
  'aria-label': ariaLabel,
  className,
  id,
  items,
  onValueChange,
  placeholder,
  renderItem,
  ...props
}: SelectFieldProps<T>) {
  const field = useFieldContext<T | undefined>()
  const isInvalid = field.state.meta.errors.length > 0
  const triggerId = id ?? field.name
  const selected = items.find((item) => item.value === field.state.value)

  const triggerContent =
    selected != null
      ? (renderItem?.(selected) ?? selected.label)
      : field.state.value == null
        ? placeholder
        : String(field.state.value)

  const handleValueChange = (nextValue: unknown) => {
    if (nextValue == null) {
      if (!allowEmpty) {
        return
      }

      field.handleChange(undefined)
      onValueChange?.(undefined)
      return
    }

    const selectedItem = items.find((item) => item.value === nextValue)

    if (selectedItem == null) {
      return
    }

    field.handleChange(selectedItem.value)
    onValueChange?.(selectedItem.value)
  }

  return (
    <Select
      name={field.name}
      onValueChange={handleValueChange}
      value={field.state.value}
      {...props}
    >
      <SelectTrigger
        aria-invalid={isInvalid}
        aria-label={ariaLabel}
        className={cn('w-full', className)}
        id={triggerId}
      >
        {triggerContent}
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false} className="p-1">
        {items.map((item) => (
          <SelectItem disabled={item.disabled} key={String(item.value)} value={item.value}>
            {renderItem?.(item) ?? item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
