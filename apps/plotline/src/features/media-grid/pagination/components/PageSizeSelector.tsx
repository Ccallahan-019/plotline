'use client'

import { Field, FieldLabel } from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { cn } from '@/lib/utils'

import { DEFAULT_PAGE_SIZE_OPTIONS, type PageSizeOption } from '../constants'

type PageSizeSelectorProps = {
  ariaLabel?: string
  className?: string
  disabled?: boolean
  onPageSizeChange: (pageSize: number) => void
  options?: PageSizeOption[]
  pageSize: number
}

export function PageSizeSelector({
  ariaLabel = 'Results per page',
  className,
  disabled = false,
  onPageSizeChange,
  options = DEFAULT_PAGE_SIZE_OPTIONS,
  pageSize,
}: PageSizeSelectorProps) {
  const selectedOption = options.find((option) => option.value === pageSize) ?? options[0]

  const handleChange = (value: null | string) => {
    if (!value) {
      return
    }

    const nextPageSize = Number(value)

    if (!Number.isNaN(nextPageSize)) {
      onPageSizeChange(nextPageSize)
    }
  }

  return (
    <Field orientation="horizontal">
      <FieldLabel htmlFor="page-size-selector">Rows per Page</FieldLabel>

      <Select disabled={disabled} onValueChange={handleChange} value={String(pageSize)}>
        <SelectTrigger aria-label={ariaLabel} className={cn(className)}>
          {selectedOption?.label ?? `${pageSize} per page`}
        </SelectTrigger>
        <SelectContent align="end" alignItemWithTrigger={false} className="p-1">
          {options.map((option) => (
            <SelectItem key={option.value} value={String(option.value)}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  )
}
