export type PaginationRangeItem = 'ellipsis' | number

export function getPaginationRange(currentPage: number, totalPages: number): PaginationRangeItem[] {
  if (totalPages <= 0) {
    return []
  }

  const delta = 2
  const range: PaginationRangeItem[] = []

  for (let page = 1; page <= totalPages; page++) {
    if (
      page === 1 ||
      page === totalPages ||
      (page >= currentPage - delta && page <= currentPage + delta)
    ) {
      range.push(page)
    } else if (range.at(-1) !== 'ellipsis') {
      range.push('ellipsis')
    }
  }

  return range
}
