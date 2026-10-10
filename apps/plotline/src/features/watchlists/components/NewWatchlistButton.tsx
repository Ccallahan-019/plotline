'use client'

import { Plus } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

export function NewWatchlistButton() {
  return (
    <Button
      className="shrink-0"
      onClick={() => {
        toast.message('Creating a watchlist is coming soon.')
      }}
      type="button"
    >
      <Plus data-icon="inline-start" />
      New Watchlist
    </Button>
  )
}
