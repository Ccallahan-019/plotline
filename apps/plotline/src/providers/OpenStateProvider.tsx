'use client'

import { createContext, PropsWithChildren, useContext, useState } from 'react'

type OpenStateContextValue = {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

const OpenStateContext = createContext<null | OpenStateContextValue>(null)

export function OpenStateProvider({ children }: PropsWithChildren) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <OpenStateContext.Provider value={{ isOpen, setIsOpen }}>{children}</OpenStateContext.Provider>
  )
}

export function useOpenState() {
  const context = useContext(OpenStateContext)
  if (!context) {
    throw new Error('useOpenState must be used within an OpenStateProvider')
  }
  return context
}
