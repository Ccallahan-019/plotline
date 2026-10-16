import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'

import { CONTINUE_WATCHING_SORTS, ContinueWatchingSort } from '../../services/continue-watching'

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
  const handleSortChange = (value: null | string) => {
    if (isContinueWatchingSort(value)) {
      setSort(value)
    }
  }

  return (
    <Select onValueChange={handleSortChange} value={sort}>
      <SelectTrigger aria-label="Sort also in progress" className="min-w-40">
        {SORT_LABELS[sort]}
      </SelectTrigger>
      <SelectContent align="end" alignItemWithTrigger={false}>
        <SelectGroup>
          {CONTINUE_WATCHING_SORTS.map((option) => (
            <SelectItem key={option} value={option}>
              {SORT_LABELS[option]}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

function isContinueWatchingSort(value: null | string): value is ContinueWatchingSort {
  return CONTINUE_WATCHING_SORTS.some((sort) => sort === value)
}
