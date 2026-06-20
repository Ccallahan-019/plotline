'use client'

import { Button } from '@/components/ui/button'
import { PaginationEllipsis } from '@/components/ui/pagination'

import type { PaginationRangeItem } from '../services/get-pagination-range'

type PaginationPageButtonProps = {
  currentPage: number
  item: PaginationRangeItem
  onPageChange: (page: number) => void
}

export function PaginationPageButton({
  currentPage,
  item,
  onPageChange,
}: PaginationPageButtonProps) {
  if (item === 'ellipsis') {
    return <PaginationEllipsis />
  }

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    onPageChange(item)
  }

  return (
    <Button onClick={handleClick} variant={currentPage !== item ? 'ghost' : 'outline'}>
      {item}
    </Button>
  )
}
