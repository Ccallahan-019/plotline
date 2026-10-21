import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'

type ViewingYearSelectorProps = {
  onYearChange: (year: number) => void
  year: number
  years: readonly number[]
}

export function ViewingYearSelector({ onYearChange, year, years }: ViewingYearSelectorProps) {
  function handleYearChange(value: null | string) {
    const next = years.find((option) => String(option) === value)

    if (next != null) {
      onYearChange(next)
    }
  }

  return (
    <Select onValueChange={handleYearChange} value={String(year)}>
      <SelectTrigger aria-label="Year" className="min-w-24" size="sm">
        {year}
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        <SelectGroup>
          {years.map((option) => (
            <SelectItem key={option} value={String(option)}>
              {option}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
