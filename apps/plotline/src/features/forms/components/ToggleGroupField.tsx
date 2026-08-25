'use client'

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { cn } from '@/lib/utils'

import { useFieldContext } from '../contexts/form-contexts'

export type ToggleGroupFieldItem<T extends string = string> = {
  disabled?: boolean
  label: string
  value: T
}

type ToggleGroupFieldProps<T extends string> = {
  allowDeselect?: boolean
  itemClassName?: string
  items: ReadonlyArray<ToggleGroupFieldItem<T>>
  onValueChange?: (value: T | undefined) => void
  renderItem?: (item: ToggleGroupFieldItem<T>) => React.ReactNode
} & Omit<
  React.ComponentProps<typeof ToggleGroup>,
  'children' | 'defaultValue' | 'onValueChange' | 'value'
>

export function ToggleGroupField<T extends string>({
  allowDeselect = false,
  className,
  itemClassName,
  items,
  onBlur,
  onValueChange,
  renderItem,
  ...props
}: ToggleGroupFieldProps<T>) {
  const field = useFieldContext<T | undefined>()
  const handleValueChange = (values: string[]) => {
    const nextValue = values[0] as T | undefined

    if (nextValue == null && !allowDeselect) {
      return
    }

    field.handleChange(nextValue)
    onValueChange?.(nextValue)
  }

  return (
    <ToggleGroup
      className={cn(
        'grid w-full gap-2 grid-cols-[repeat(auto-fill,minmax(min(100%,7rem),1fr))]',
        className,
      )}
      onBlur={(event) => {
        field.handleBlur()
        onBlur?.(event)
      }}
      onValueChange={handleValueChange}
      value={field.state.value == null ? [] : [field.state.value]}
      {...props}
    >
      {items.map((item) => (
        <ToggleGroupItem
          aria-label={item.label}
          className={itemClassName}
          disabled={item.disabled}
          key={item.value}
          value={item.value}
          variant="outline"
        >
          {renderItem?.(item) ?? item.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
