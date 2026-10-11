import { PropsWithChildren } from 'react'

import { cn } from '@/lib/utils'

type MediaGridContainerProps = PropsWithChildren<{
  className?: string
}>

export function MediaGridContainer({ children, className }: MediaGridContainerProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 xs:grid-cols-2 sm:max-md:grid-cols-3 gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5',
        className,
      )}
    >
      {children}
    </div>
  )
}
