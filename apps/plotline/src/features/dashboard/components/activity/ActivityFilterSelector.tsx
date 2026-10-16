import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'

type ActivityFilterSelectorProps = {
  ariaLabel: string
  onValueChange: (value: null | string) => void
  options: readonly { label: string; value: string }[]
  value: string
}

export function ActivityFilterSelector({
  ariaLabel,
  onValueChange,
  options,
  value,
}: ActivityFilterSelectorProps) {
  const label = options.find((option) => option.value === value)?.label ?? value

  return (
    <Select onValueChange={onValueChange} value={value}>
      <SelectTrigger aria-label={ariaLabel} className="min-w-36">
        {label}
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        <SelectGroup>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
