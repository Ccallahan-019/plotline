import { cn } from 'cn'
import { GripVertical } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'

type WatchlistMembershipDragButtonProps = {
  disabled: boolean
  handleRef: (element: Element | null) => void
  title: string
}

export function WatchlistMembershipDragButton({
  disabled,
  handleRef,
  title,
}: WatchlistMembershipDragButtonProps) {
  return (
    <button
      aria-label={`Reorder ${title}`}
      className={cn(
        buttonVariants({ size: 'icon-sm', variant: 'ghost' }),
        'cursor-grab touch-none active:cursor-grabbing',
      )}
      disabled={disabled}
      ref={handleRef}
      type="button"
    >
      <GripVertical />
    </button>
  )
}
