'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { ShowIf } from '@/components/utils/ShowIf'

type LogWatchEpisodeRowProps = {
  disabled?: boolean
  isSelected: boolean
  isWatched: boolean
  label: string
  onSelectedChange: (checked: boolean) => void
  selectedId: string
}

export function LogWatchEpisodeRow({
  disabled = false,
  isSelected,
  isWatched,
  label,
  onSelectedChange,
  selectedId,
}: LogWatchEpisodeRowProps) {
  const handleSelectedChange = (checked: boolean) => {
    onSelectedChange(checked === true)
  }

  return (
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

      <ShowIf condition={isWatched}>
        <FieldDescription className="text-xs leading-none">Watched</FieldDescription>
      </ShowIf>
    </Field>
  )
}
