'use client'

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from '@/components/ui/combobox'

import { useFieldContext } from '../contexts/form-contexts'

export type ComboboxFieldItem<T extends number | string = string> = {
  disabled?: boolean
  label: string
  value: T
}

type ComboboxFieldProps<T extends number | string> = {
  disabled?: boolean
  emptyContent?: React.ReactNode
  id?: string
  items: ReadonlyArray<ComboboxFieldItem<T>>
  onValueChange?: (value: T[]) => void
  placeholder?: string
  renderChip?: (item: ComboboxFieldItem<T>) => React.ReactNode
  renderItem?: (item: ComboboxFieldItem<T>) => React.ReactNode
}

export function ComboboxField<T extends number | string>({
  disabled,
  emptyContent,
  id,
  items,
  onValueChange,
  placeholder,
  renderChip,
  renderItem,
}: ComboboxFieldProps<T>) {
  const field = useFieldContext<T[]>()
  const anchor = useComboboxAnchor()
  const isInvalid = field.state.meta.errors.length > 0
  const inputId = id ?? field.name
  const selectedItems = items.filter((item) => field.state.value.includes(item.value))
  const placeholderText = selectedItems.length > 0 ? '' : placeholder

  const handleValueChange = (nextValue: ComboboxFieldItem<T>[]) => {
    const nextValues = nextValue.map((item) => item.value)

    field.handleChange(nextValues)
    onValueChange?.(nextValues)
  }

  return (
    <Combobox<ComboboxFieldItem<T>, true>
      disabled={disabled}
      isItemEqualToValue={(a, b) => a?.value === b?.value}
      items={items}
      itemToStringLabel={(item) => item?.label ?? ''}
      multiple
      name={field.name}
      onValueChange={handleValueChange}
      value={selectedItems}
    >
      <ComboboxChips ref={anchor}>
        <ComboboxValue>
          {(value: ComboboxFieldItem<T>[]) =>
            value.map((item) => (
              <ComboboxChip key={String(item.value)} showRemove={!item.disabled}>
                {renderChip?.(item) ?? item.label}
              </ComboboxChip>
            ))
          }
        </ComboboxValue>
        <ComboboxChipsInput
          aria-invalid={isInvalid}
          disabled={disabled}
          id={inputId}
          onBlur={field.handleBlur}
          placeholder={placeholderText}
        />
      </ComboboxChips>

      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>{emptyContent}</ComboboxEmpty>
        <ComboboxList>
          {(item: ComboboxFieldItem<T>) => (
            <ComboboxItem disabled={item.disabled || disabled} key={String(item.value)} value={item}>
              {renderItem?.(item) ?? item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
