type PaginationResultsProps = {
  page: number
  totalPages: number
  totalResults?: number
}

export function PaginationResults({ page, totalPages, totalResults }: PaginationResultsProps) {
  if (totalResults === undefined) {
    return (
      <p className="text-sm text-muted-foreground">
        Page {page} of {totalPages.toLocaleString()}
      </p>
    )
  }

  return (
    <p className="text-sm text-muted-foreground">
      Page {page} of {totalPages.toLocaleString()} ({totalResults.toLocaleString()} results)
    </p>
  )
}
