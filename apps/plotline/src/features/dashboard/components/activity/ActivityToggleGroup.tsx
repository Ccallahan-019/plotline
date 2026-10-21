import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

type ActivityToggleGroupProps<T extends string> = {
  ariaLabel: string
  onValueChange: (value: T) => void
  options: readonly ActivityToggleOption<T>[]
  value: T
}

type ActivityToggleOption<T extends string> = {
  label: string
  value: T
}

export function ActivityToggleGroup<T extends string>({
  ariaLabel,
  onValueChange,
  options,
  value,
}: ActivityToggleGroupProps<T>) {
  function handleValueChange(values: string[]) {
    const next = options.find((option) => option.value === values[0])

    if (next) {
      onValueChange(next.value)
    }
  }

  return (
    <ToggleGroup
      aria-label={ariaLabel}
      className="max-w-full flex-wrap"
      onValueChange={handleValueChange}
      size="sm"
      spacing={0}
      value={[value]}
      variant="outline"
    >
      {options.map((option) => (
        <ToggleGroupItem key={option.value} value={option.value}>
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
