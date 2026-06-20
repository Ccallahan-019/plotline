'use client'

import { Pagination, PaginationContent, PaginationItem } from '@/components/ui/pagination'
import { ShowIf } from '@/components/utils/ShowIf'
import { cn } from '@/lib/utils'

import { useScrollOnPageChange } from '../hooks/use-scroll-on-page-change'
import { getPaginationRange } from '../services/get-pagination-range'
import { PaginationNextButton } from './PaginationNextButton'
import { PaginationPageButton } from './PaginationPageButton'
import { PaginationPreviousButton } from './PaginationPreviousButton'
import { PaginationResults } from './PaginationResults'

type PaginationBarProps = {
  className?: string
  onPageChange: (page: number) => void
  page: number
  scrollTargetId?: string
  showResultsSummary?: boolean
  totalPages: number
  totalResults?: number
}

export function PaginationBar({
  className,
  onPageChange,
  page,
  scrollTargetId,
  showResultsSummary = true,
  totalPages,
  totalResults,
}: PaginationBarProps) {
  useScrollOnPageChange({ page, scrollTargetId, totalPages })

  const paginationRange = getPaginationRange(page, totalPages)

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPreviousButton onPageChange={onPageChange} page={page} />
          </PaginationItem>
          {paginationRange.map((item, index) => (
            <PaginationPageButton
              currentPage={page}
              item={item}
              key={`pagination-${item}-${index}`}
              onPageChange={onPageChange}
            />
          ))}
          <PaginationItem>
            <PaginationNextButton onPageChange={onPageChange} page={page} totalPages={totalPages} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      <ShowIf condition={showResultsSummary}>
        <PaginationResults page={page} totalPages={totalPages} totalResults={totalResults} />
      </ShowIf>
    </div>
  )
}
