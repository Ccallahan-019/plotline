import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldLabel } from '@/components/ui/field'
import { cn } from '@/lib/utils'

import type { FilterCheckboxItem } from '../types'

type FilterCheckboxProps = {
  fieldIdPrefix?: string
  filterItem: FilterCheckboxItem
  isChecked: boolean
  onToggle: (filterItemId: number | string, checked: boolean) => void
}

export function FilterCheckbox({
  fieldIdPrefix = 'filter',
  filterItem,
  isChecked,
  onToggle,
}: FilterCheckboxProps) {
  const fieldId = `${fieldIdPrefix}-${filterItem.id}`

  const handleToggle = (checked: boolean) => {
    onToggle(filterItem.id, checked === true)
  }

  return (
    <Field orientation="horizontal">
      <Checkbox checked={isChecked} id={fieldId} onCheckedChange={handleToggle} />
      <FieldLabel className={cn(!isChecked && 'text-muted-foreground')} htmlFor={fieldId}>
        {filterItem.name}
      </FieldLabel>
    </Field>
  )
}
