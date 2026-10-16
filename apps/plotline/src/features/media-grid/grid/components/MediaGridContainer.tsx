import { PropsWithChildren } from 'react'

import { cn } from '@/lib/utils'

type MediaGridContainerProps = PropsWithChildren<{
  className?: string
}>

export function MediaGridContainer({ children, className }: MediaGridContainerProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 sm:grid-cols-4 md:max-lg:grid-cols-3 gap-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6',
        className,
      )}
    >
      {children}
    </div>
  )
}
