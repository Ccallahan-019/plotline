'use client'

import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { ShowIf } from '@/components/utils/ShowIf'

import type { FilterCheckboxItem } from '../types'

import { useExpandedCheckboxList } from '../hooks/use-expanded-checkbox-list'
import { sortCheckboxItemsWithSelectedFirst, toggleIdInArray } from '../services/checkbox-list'
import { FilterCheckbox } from './FilterCheckbox'

type CollapsibleCheckboxGroupProps<T extends FilterCheckboxItem> = {
  fieldIdPrefix: string
  items: T[]
  label: string
  onChange: (selectedIds: Array<number | string>) => void
  selectedIds: Array<number | string>
  showAllLabel?: string
}

export function CollapsibleCheckboxGroup<T extends FilterCheckboxItem>({
  fieldIdPrefix,
  items,
  label,
  onChange,
  selectedIds,
  showAllLabel,
}: CollapsibleCheckboxGroupProps<T>) {
  const { expanded, hasHiddenItems, hiddenItems, setExpanded, triggerText, visibleItems } =
    useExpandedCheckboxList({
      items,
      selectedIds,
    })

  const handleToggle = (id: number | string, checked: boolean) => {
    onChange(toggleIdInArray(selectedIds, id, checked))
  }

  const renderList = (listItems: T[]) => {
    const sortedItems = sortCheckboxItemsWithSelectedFirst(listItems, selectedIds)

    return sortedItems.map((item) => (
      <FilterCheckbox
        fieldIdPrefix={fieldIdPrefix}
        filterItem={item}
        isChecked={selectedIds.includes(item.id)}
        key={item.id}
        onToggle={handleToggle}
      />
    ))
  }

  const resolvedTriggerText = showAllLabel ?? triggerText.replace('options', label.toLowerCase())

  return (
    <Field>
      <FieldLabel className="font-semibold mb-2">{label}</FieldLabel>
      <ShowIf condition={hasHiddenItems}>
        <Collapsible onOpenChange={setExpanded} open={expanded}>
          <FieldGroup data-slot="checkbox-group">{renderList(visibleItems)}</FieldGroup>
          <CollapsibleTrigger
            className="mt-2"
            render={<Button size="xs" type="button" variant="ghost" />}
          >
            {expanded ? 'Show less' : resolvedTriggerText}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <FieldGroup className="mt-2" data-slot="checkbox-group">
              {renderList(hiddenItems)}
            </FieldGroup>
          </CollapsibleContent>
        </Collapsible>
      </ShowIf>

      <ShowIf condition={!hasHiddenItems}>
        <FieldGroup data-slot="checkbox-group">{renderList(items)}</FieldGroup>
      </ShowIf>
    </Field>
  )
}
