import { ImageOff } from 'lucide-react'
import Image from 'next/image'

import { AspectRatio } from '@/components/ui/aspect-ratio'
import { cn } from '@/lib/utils'

type MediaPosterProps = {
  alt?: string
  className?: string
  fallbackIconClassName?: string
  ratio?: number
  sizes: string
  src?: null | string
}

/**
 * Cover image in a muted frame, or an image-off icon when `src` is missing.
 *
 * The frame has no intrinsic height. Pass `ratio` for a poster box, or size it with
 * `className` (fixed height, min-height, or stretch). `sizes` is the rendered width
 * hint passed to the image.
 */
export function MediaPoster({
  alt = '',
  className,
  fallbackIconClassName = 'size-5',
  ratio,
  sizes,
  src,
}: MediaPosterProps) {
  const frameClassName = cn('overflow-hidden bg-muted', className)
  const content = src ? (
    <Image alt={alt} className="object-cover" fill sizes={sizes} src={src} />
  ) : (
    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
      <ImageOff aria-hidden className={fallbackIconClassName} />
    </div>
  )

  if (ratio != null) {
    return (
      <AspectRatio className={frameClassName} ratio={ratio}>
        {content}
      </AspectRatio>
    )
  }

  return <div className={cn('relative', frameClassName)}>{content}</div>
}
