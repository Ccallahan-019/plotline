import type { ReactNode } from 'react'

import Image from 'next/image'

import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type MediaBackdropCardProps = {
  backdropUrl: null | string
  children: ReactNode
  className?: string
  imageSizes?: string
  size?: 'default' | 'sm'
  wrapperClassName?: string
}

/**
 * Card with optional artwork along the right edge.
 *
 * A URL paints the still over the right half, fading from the card color on
 * the inner edge to clear at the outer edge. A null URL is a standard card.
 */
export function MediaBackdropCard({
  backdropUrl,
  children,
  className,
  imageSizes,
  size,
  wrapperClassName,
}: MediaBackdropCardProps) {
  if (backdropUrl == null) {
    return (
      <Card className={className} size={size}>
        {children}
      </Card>
    )
  }

  return (
    <Card className={cn('relative', className)} size={size}>
      {/* Capped so a tall card does not show the still's own title through the metadata. */}
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute top-0 right-0 z-0 h-full w-1/2',
          wrapperClassName,
        )}
      >
        <Image
          alt=""
          className="object-cover object-[center_30%]"
          fill
          sizes={imageSizes ?? '280px'}
          src={backdropUrl}
        />
        {/* Solid on the inner edge and clear at the card edge, so the art strengthens toward the right. */}
        <div className="absolute inset-0 bg-linear-to-r from-card from-0% via-card/80 via-40% to-card/50" />
      </div>
      <div className="relative z-10 flex min-w-0 flex-col gap-(--card-spacing)">{children}</div>
    </Card>
  )
}
