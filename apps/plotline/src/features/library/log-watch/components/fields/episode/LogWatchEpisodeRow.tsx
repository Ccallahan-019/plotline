'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldLabel } from '@/components/ui/field'

type LogWatchEpisodeRowProps = {
  disabled?: boolean
  isRewatch: boolean
  isSelected: boolean
  label: string
  onRewatchChange: (checked: boolean) => void
  onSelectedChange: (checked: boolean) => void
  rewatchId: string
  selectedId: string
}

export function LogWatchEpisodeRow({
  disabled = false,
  isRewatch,
  isSelected,
  label,
  onRewatchChange,
  onSelectedChange,
  rewatchId,
  selectedId,
}: LogWatchEpisodeRowProps) {
  const handleSelectedChange = (checked: boolean) => {
    onSelectedChange(checked === true)
  }

  const handleRewatchChange = (checked: boolean) => {
    onRewatchChange(checked === true)
  }

  return (
    <div className="flex items-center gap-3">
      <Field className="min-w-0 flex-1" orientation="horizontal">
        <Checkbox
          checked={isSelected}
          disabled={disabled}
          id={selectedId}
          onCheckedChange={handleSelectedChange}
        />
        <FieldLabel className="min-w-0 truncate font-normal" htmlFor={selectedId}>
          {label}
        </FieldLabel>
      </Field>

      <Field
        className="w-auto shrink-0"
        data-disabled={disabled || !isSelected}
        orientation="horizontal"
      >
        <Checkbox
          checked={isRewatch}
          disabled={disabled || !isSelected}
          id={rewatchId}
          onCheckedChange={handleRewatchChange}
        />
        <FieldLabel className="font-normal" htmlFor={rewatchId}>
          Rewatch
        </FieldLabel>
      </Field>
    </div>
  )
}
