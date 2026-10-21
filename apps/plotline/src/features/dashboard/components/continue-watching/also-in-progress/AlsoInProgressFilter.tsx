import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

import {
  ContinueWatchingCounts,
  ContinueWatchingTypeFilter,
} from '../../../services/continue-watching'

type AlsoInProgressFilterProps = {
  counts: ContinueWatchingCounts
  mediaType: ContinueWatchingTypeFilter
  setMediaType: (mediaType: ContinueWatchingTypeFilter) => void
}

export function AlsoInProgressFilter({
  counts,
  mediaType,
  setMediaType,
}: AlsoInProgressFilterProps) {
  function handleMediaTypeChange(values: string[]) {
    const next = values[0]

    if (next === 'all' || next === 'movie' || next === 'tv') {
      setMediaType(next)
    }
  }

  return (
    <ToggleGroup
      aria-label="Filter also in progress"
      onValueChange={handleMediaTypeChange}
      size="sm"
      value={[mediaType]}
      variant="outline"
    >
      <ToggleGroupItem value="all">All &middot; {counts.all}</ToggleGroupItem>
      <ToggleGroupItem value="tv">TV &middot; {counts.tv}</ToggleGroupItem>
      <ToggleGroupItem value="movie">Film &middot; {counts.film}</ToggleGroupItem>
    </ToggleGroup>
  )
}
