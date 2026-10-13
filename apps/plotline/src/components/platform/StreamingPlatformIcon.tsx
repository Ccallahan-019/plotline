'use client'

import type { StreamingPlatform, StreamingPlatformLucideIcon } from '@plotline/shared/constants'
import type { LucideIcon } from 'lucide-react'

import { getStreamingPlatformMeta } from '@plotline/shared/constants'
import { Clapperboard, Disc, MoreHorizontal, Tv } from 'lucide-react'
import Image from 'next/image'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { tmdbLogoUrl } from '@/lib/tmdb/tmdb-image-url'
import { cn } from '@/lib/utils'

const LUCIDE_ICONS = {
  clapperboard: Clapperboard,
  disc: Disc,
  'more-horizontal': MoreHorizontal,
} as const satisfies Record<StreamingPlatformLucideIcon, LucideIcon>

export type StreamingPlatformIconProps = {
  className?: string
  logoPath?: null | string
  platform: StreamingPlatform
}

export function StreamingPlatformIcon({
  className,
  logoPath,
  platform,
}: StreamingPlatformIconProps) {
  const meta = getStreamingPlatformMeta(platform)
  const glyph = <PlatformGlyph logoPath={logoPath} lucideIcon={meta.lucideIcon} />

  return (
    <Tooltip>
      <TooltipTrigger
        delay={200}
        render={
          <span
            aria-label={meta.label}
            className={cn('flex flex-col items-center gap-2', className)}
          >
            {glyph}
            <span className="text-sm">{meta.label}</span>
          </span>
        }
      />
      <TooltipContent>{meta.label}</TooltipContent>
    </Tooltip>
  )
}

function PlatformGlyph({
  logoPath,
  lucideIcon,
}: {
  logoPath?: null | string
  lucideIcon?: StreamingPlatformLucideIcon
}) {
  const sizeClass = 'size-9'
  const iconSizeClass = 'size-6'

  if (logoPath) {
    return (
      <Image
        alt=""
        aria-hidden
        className={cn(sizeClass, 'rounded-sm object-contain')}
        height={28}
        src={tmdbLogoUrl(logoPath)}
        width={28}
      />
    )
  }

  const Icon = lucideIcon ? LUCIDE_ICONS[lucideIcon] : Tv

  return (
    <div className="rounded-sm bg-muted p-2">
      <Icon aria-hidden className={iconSizeClass} strokeWidth={1.5} />
    </div>
  )
}
