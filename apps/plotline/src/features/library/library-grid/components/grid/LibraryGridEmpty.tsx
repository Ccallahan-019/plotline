'use client'

import { Library, Plus } from 'lucide-react'

import type { MediaFilters } from '@/features/media-grid/filters/types'

import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { ShowIf } from '@/components/utils/ShowIf'
import { hasActiveFilters } from '@/features/media-grid/filters/services/normalize-filters'

import { getLibraryEmptyCopy } from '../../constants/library-empty-copy'
import { useLibraryTitleSearch } from '../../providers/LibraryTitleSearchProvider'

type LibraryGridEmptyProps = {
  filters?: MediaFilters
}

export function LibraryGridEmpty({ filters }: LibraryGridEmptyProps) {
  const { setOpen } = useLibraryTitleSearch()
  const resolvedFilters = filters ?? {}
  const emptyCopy = getLibraryEmptyCopy(resolvedFilters)

  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Library />
        </EmptyMedia>

        <EmptyTitle>{emptyCopy.title}</EmptyTitle>
        <EmptyDescription>{emptyCopy.description}</EmptyDescription>
      </EmptyHeader>

      <ShowIf condition={!hasActiveFilters(resolvedFilters)}>
        <EmptyContent>
          {/* Opens the heading dialog, which stays mounted after this empty state is replaced. */}
          <Button onClick={() => setOpen(true)} type="button" variant="outline">
            <Plus data-icon="inline-start" />
            Add Title
          </Button>
        </EmptyContent>
      </ShowIf>
    </Empty>
  )
}
