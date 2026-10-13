'use client'

import { useEffect, useState } from 'react'

export type MembershipLayout = 'grid' | 'rows'

const MOBILE_LAYOUT_QUERY = '(max-width: 767px)'

type UseMembershipLayoutResult = {
  /** Layout the toggle shows. `null` until the viewport is measured. */
  active: MembershipLayout | null
  /** Explicit pick from `md` up. Below `md` the list stays a grid. */
  locked: MembershipLayout | null
  setLayout: (layout: MembershipLayout) => void
}

/**
 * Rows or grid for a watchlist membership list.
 *
 * The list is a grid below the `md` breakpoint, and the layout toggle is hidden
 * there. From `md` up it stays rows until the member picks a layout, and that
 * pick lasts for the visit. Manual sort and drag stay on the row view.
 *
 * @returns The toggle layout, the locked layout, and a setter for an explicit pick
 */
export function useMembershipLayout(): UseMembershipLayoutResult {
  const [locked, setLocked] = useState<MembershipLayout | null>(null)
  const [isMobile, setIsMobile] = useState<boolean | null>(null)

  useEffect(() => {
    const media = window.matchMedia(MOBILE_LAYOUT_QUERY)
    const update = () => {
      setIsMobile(media.matches)
    }

    update()
    media.addEventListener('change', update)

    return () => {
      media.removeEventListener('change', update)
    }
  }, [])

  const active: MembershipLayout | null =
    locked ?? (isMobile == null ? null : isMobile ? 'grid' : 'rows')

  return { active, locked, setLayout: setLocked }
}
