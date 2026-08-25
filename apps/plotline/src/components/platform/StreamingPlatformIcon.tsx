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

const SIZE_PX = {
  md: 28,
  sm: 20,
} as const

export type StreamingPlatformIconProps = {
  className?: string
  logoPath?: null | string
  platform: StreamingPlatform
  showLabel?: boolean
  size?: 'md' | 'sm'
}

export function StreamingPlatformIcon({
  className,
  logoPath,
  platform,
  showLabel = false,
  size = 'sm',
}: StreamingPlatformIconProps) {
  const meta = getStreamingPlatformMeta(platform)
  const glyph = <PlatformGlyph logoPath={logoPath} lucideIcon={meta.lucideIcon} size={size} />

  const content = (
    <span
      aria-label={showLabel ? undefined : meta.label}
      className={cn('flex flex-col items-center gap-2', className)}
    >
      {glyph}
      {showLabel ? <span className="text-sm">{meta.label}</span> : null}
    </span>
  )

  if (showLabel) {
    return content
  }

  return (
    <Tooltip>
      <TooltipTrigger delay={200} render={content} />
      <TooltipContent>{meta.label}</TooltipContent>
    </Tooltip>
  )
}

function PlatformGlyph({
  logoPath,
  lucideIcon,
  size,
}: {
  logoPath?: null | string
  lucideIcon?: StreamingPlatformLucideIcon
  size: 'md' | 'sm'
}) {
  const pixelSize = SIZE_PX[size]
  const sizeClass = size === 'sm' ? 'size-5' : 'size-9'
  const iconSizeClass = size === 'sm' ? 'size-4' : 'size-6'

  if (logoPath) {
    return (
      <Image
        alt=""
        aria-hidden
        className={cn(sizeClass, 'rounded-sm object-contain')}
        height={pixelSize}
        src={tmdbLogoUrl(logoPath)}
        width={pixelSize}
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
