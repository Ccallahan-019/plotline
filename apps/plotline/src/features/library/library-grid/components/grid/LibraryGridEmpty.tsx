import { Library } from 'lucide-react'

import type { MediaFilters } from '@/features/media-grid/filters/types'

import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'

import { getLibraryEmptyCopy } from '../../constants/library-empty-copy'

type LibraryGridEmptyProps = {
  filters?: MediaFilters
}

export function LibraryGridEmpty({ filters }: LibraryGridEmptyProps) {
  const emptyCopy = getLibraryEmptyCopy(filters ?? {})

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Library />
        </EmptyMedia>

        <EmptyTitle>{emptyCopy.title}</EmptyTitle>
        <EmptyDescription>{emptyCopy.description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
