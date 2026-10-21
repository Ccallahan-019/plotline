'use client'

import { Ellipsis } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type ContinueWatchingTitleMenuProps = {
  href: string
  title: string
}

export function ContinueWatchingTitleMenu({ href, title }: ContinueWatchingTitleMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            aria-label={`More actions for ${title}`}
            size="icon"
            type="button"
            variant="outline"
          />
        }
      >
        <Ellipsis />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        <DropdownMenuItem render={<Link href={href} />}>View Title Details</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
