import { PaginationPrevious } from '@/components/ui/pagination'

type PaginationPreviousButtonProps = {
  onPageChange: (page: number) => void
  page: number
}

export function PaginationPreviousButton({ onPageChange, page }: PaginationPreviousButtonProps) {
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()

    if (page > 1) {
      onPageChange(page - 1)
    }
  }

  return (
    <PaginationPrevious
      aria-disabled={page <= 1}
      className={page <= 1 ? 'pointer-events-none opacity-50' : undefined}
      href="#"
      onClick={handleClick}
    />
  )
}
