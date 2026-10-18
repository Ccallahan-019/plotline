import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  CONTINUE_WATCHING_SORTS,
  ContinueWatchingSort,
} from '@/features/dashboard/services/continue-watching'

const SORT_LABELS: Record<ContinueWatchingSort, string> = {
  'almost-done': 'Almost Done',
  'last-watched': 'Last Watched',
  'most-progress': 'Most Progress',
}

type ContinueWatchingSortSelectorProps = {
  setSort: (sort: ContinueWatchingSort) => void
  sort: ContinueWatchingSort
}

export function ContinueWatchingSortSelector({ setSort, sort }: ContinueWatchingSortSelectorProps) {
  function handleSortChange(values: string[]) {
    const next = values[0]

    if (isContinueWatchingSort(next)) {
      setSort(next)
    }
  }

  return (
    <ToggleGroup
      aria-label="Sort also in progress"
      className="max-w-full flex-wrap"
      onValueChange={handleSortChange}
      size="sm"
      spacing={0}
      value={[sort]}
      variant="outline"
    >
      {CONTINUE_WATCHING_SORTS.map((option) => (
        <ToggleGroupItem key={option} value={option}>
          {SORT_LABELS[option]}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

function isContinueWatchingSort(value: string | undefined): value is ContinueWatchingSort {
  return CONTINUE_WATCHING_SORTS.some((sort) => sort === value)
}
