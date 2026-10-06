import { MediaGridContainer } from './MediaGridContainer'
import { MediaGridLoading } from './MediaGridLoading'

type MediaGridProps<T> = {
  className?: string
  items: T[]
  renderItem: (item: T) => React.ReactNode
  state: 'empty' | 'error' | 'loading' | 'success'
  states: {
    emptyState: React.ReactNode
    errorState: React.ReactNode
  }
}

export function MediaGrid<T>({ className, items, renderItem, state, states }: MediaGridProps<T>) {
  switch (state) {
    case 'empty':
      return states.emptyState
    case 'error':
      return states.errorState
    case 'loading':
      return <MediaGridLoading />
    case 'success':
      return <MediaGridContainer className={className}>{items.map(renderItem)}</MediaGridContainer>
  }
}
