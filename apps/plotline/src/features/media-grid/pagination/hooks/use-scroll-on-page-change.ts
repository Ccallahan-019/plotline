import { useEffect, useRef } from 'react'

type UseScrollOnPageChangeProps = {
  page: number
  scrollTargetId?: string
  totalPages: number
}

export function useScrollOnPageChange({
  page,
  scrollTargetId,
  totalPages,
}: UseScrollOnPageChangeProps) {
  const prevPageRef = useRef(page)

  useEffect(() => {
    if (!scrollTargetId || prevPageRef.current === page) {
      return
    }

    prevPageRef.current = page
    document.getElementById(scrollTargetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [page, scrollTargetId])

  if (totalPages <= 1) {
    return null
  }
}
