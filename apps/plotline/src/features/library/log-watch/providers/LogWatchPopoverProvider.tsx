'use client'

import {
  ComponentProps,
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from 'react'

import { Button } from '@/components/ui/button'

type LogWatchPopoverContextValue = {
  isDialogOpen: boolean
  isPopoverOpen: boolean
  setDialogOpen: (open: boolean) => void
  setPopoverOpen: (open: boolean) => void
  triggerLabel?: null | string
  triggerSize?: ComponentProps<typeof Button>['size']
} | null

type LogWatchPopoverProviderProps = {
  triggerLabel?: null | string
  triggerSize?: ComponentProps<typeof Button>['size']
}

const LogWatchPopoverContext = createContext<LogWatchPopoverContextValue | null>(null)

export function LogWatchPopoverProvider({
  children,
  triggerLabel,
  triggerSize,
}: PropsWithChildren<LogWatchPopoverProviderProps>) {
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [isPopoverOpen, setPopoverOpen] = useState(false)

  const value = useMemo(
    () => ({
      isDialogOpen,
      isPopoverOpen,
      setDialogOpen,
      setPopoverOpen,
      triggerLabel,
      triggerSize,
    }),
    [isDialogOpen, isPopoverOpen, triggerLabel, triggerSize],
  )
  return <LogWatchPopoverContext.Provider value={value}>{children}</LogWatchPopoverContext.Provider>
}

export function useLogWatchPopover() {
  const context = useContext(LogWatchPopoverContext)
  if (!context) {
    throw new Error('useLogWatchPopover must be used within a LogWatchPopoverProvider')
  }
  return context
}
