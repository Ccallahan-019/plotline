'use client'

import { SlidersHorizontal } from 'lucide-react'
import { Fragment } from 'react'

import { FieldGroup } from '@/components/ui/field'
import { Separator } from '@/components/ui/separator'
import { SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'

import { useFilterErrors } from '../providers/FilterErrorsProvider'
import { useFilterRegistry } from '../providers/FilterRegistryProvider'
import { useFilters } from '../providers/FiltersProvider'
import { ApplyFiltersButton } from './ApplyFiltersButton'
import { ClearAllFiltersButton } from './ClearAllFiltersButton'
import { FiltersSheet } from './FiltersSheet'

type FilterSheetProps = {
  onApply?: () => void
}

export function FilterSheet({ onApply }: FilterSheetProps) {
  const { draftFilters, setDraftFilters } = useFilters()
  const { errors, setError } = useFilterErrors()
  const { context, visibleDefinitions } = useFilterRegistry()

  return (
    <FiltersSheet>
      <SheetContent side="right">
        <div className="inset-x-0">
          <SheetHeader>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="size-4 text-primary" />
              <SheetTitle>Filters</SheetTitle>
            </div>
          </SheetHeader>
          <Separator />
        </div>

        <FieldGroup className="px-4 overflow-y-auto scrollbar-thin">
          {visibleDefinitions.map((definition, index) => (
            <Fragment key={definition.key}>
              {definition.render({
                context,
                draftFilters,
                errors,
                setDraftFilters,
                setError,
              })}
              {index < visibleDefinitions.length - 1 ? <Separator /> : null}
            </Fragment>
          ))}
        </FieldGroup>

        <SheetFooter>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <ClearAllFiltersButton />
            </div>
            <ApplyFiltersButton onApply={onApply} />
          </div>
        </SheetFooter>
      </SheetContent>
    </FiltersSheet>
  )
}
