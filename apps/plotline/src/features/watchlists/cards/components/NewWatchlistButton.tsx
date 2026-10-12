import { Plus } from 'lucide-react'
import Link from 'next/link'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type NewWatchlistButtonProps = {
  challenge?: boolean
  label?: string
}

export function NewWatchlistButton({
  challenge = false,
  label = 'New Watchlist',
}: NewWatchlistButtonProps) {
  const href = challenge ? '/dashboard/watchlists/new?challenge=1' : '/dashboard/watchlists/new'

  return (
    <Link className={cn(buttonVariants(), 'shrink-0')} href={href}>
      <Plus data-icon="inline-start" />
      {label}
    </Link>
  )
}
