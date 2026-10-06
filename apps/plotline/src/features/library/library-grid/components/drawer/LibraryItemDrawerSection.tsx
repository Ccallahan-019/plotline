import type { PropsWithChildren } from 'react'

import { cn } from '@/lib/utils'

type LibraryItemDrawerSectionProps = PropsWithChildren<{
  className?: string
  title: string
}>

export function LibraryItemDrawerSection({
  children,
  className,
  title,
}: LibraryItemDrawerSectionProps) {
  return (
    <section className={cn('flex flex-col gap-3', className)}>
      <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{title}</h3>

      {children}
    </section>
  )
}
