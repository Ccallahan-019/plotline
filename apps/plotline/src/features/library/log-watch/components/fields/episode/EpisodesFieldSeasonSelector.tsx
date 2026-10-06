import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'

type EpisodesFieldSeasonSelectorProps = {
  disabled?: boolean
  season: number
  seasonOptions: number[]
  setSeason: (season: number) => void
}

export function EpisodesFieldSeasonSelector({
  disabled = false,
  season,
  seasonOptions,
  setSeason,
}: EpisodesFieldSeasonSelectorProps) {
  const handleValueChange = (value: null | number) => {
    if (value != null) {
      setSeason(value)
    }
  }

  return (
    <Select disabled={disabled} onValueChange={handleValueChange} value={season}>
      <SelectTrigger aria-label="Season" className="w-full" id="log-watch-dialog-season">
        Season {season}
      </SelectTrigger>
      <SelectContent className="p-1">
        {seasonOptions.map((option) => (
          <SelectItem key={option} value={option}>
            Season {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
