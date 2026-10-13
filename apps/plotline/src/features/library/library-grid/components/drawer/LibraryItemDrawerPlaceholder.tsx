import { cn } from '@/lib/utils'

type LibraryItemDrawerPlaceholderProps = {
  className?: string
  value: null | string
}

export function LibraryItemDrawerPlaceholder({
  className,
  value,
}: LibraryItemDrawerPlaceholderProps) {
  return <p className={cn('text-sm text-foreground', className)}>{value ?? '—'}</p>
}
