'use client'

import { createContext, type PropsWithChildren, useContext, useMemo, useState } from 'react'

type LibraryTitleSearchContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
}

const LibraryTitleSearchContext = createContext<LibraryTitleSearchContextValue | null>(null)

// Keeps title-search visibility above the grid so the dialog survives the empty state unmounting.
export function LibraryTitleSearchProvider({ children }: PropsWithChildren) {
  const [open, setOpen] = useState(false)
  const value = useMemo(() => ({ open, setOpen }), [open])

  return (
    <LibraryTitleSearchContext.Provider value={value}>{children}</LibraryTitleSearchContext.Provider>
  )
}

/**
 * Shared open state for the library title-search dialog.
 *
 * The heading renders the dialog. The empty state only asks for it to open, so
 * a successful add can leave the dialog open after the empty state unmounts.
 *
 * @returns The dialog open flag and a setter
 * @throws When called outside `LibraryTitleSearchProvider`
 */
export function useLibraryTitleSearch() {
  const context = useContext(LibraryTitleSearchContext)

  if (!context) {
    throw new Error('useLibraryTitleSearch must be used within LibraryTitleSearchProvider')
  }

  return context
}
