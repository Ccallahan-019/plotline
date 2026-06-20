'use client'

import { PaginationNext } from '@/components/ui/pagination'

type PaginationNextButtonProps = {
  onPageChange: (page: number) => void
  page: number
  totalPages: number
}

export function PaginationNextButton({
  onPageChange,
  page,
  totalPages,
}: PaginationNextButtonProps) {
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()

    if (page < totalPages) {
      onPageChange(page + 1)
    }
  }

  return (
    <PaginationNext
      aria-disabled={page >= totalPages}
      className={page >= totalPages ? 'pointer-events-none opacity-50' : undefined}
      href="#"
      onClick={handleClick}
    />
  )
}
