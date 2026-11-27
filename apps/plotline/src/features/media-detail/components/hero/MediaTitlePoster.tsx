import { ExternalLink } from 'lucide-react'
import Link from 'next/link'

import { MediaPoster } from '@/components/media/MediaPoster'
import { cn } from '@/lib/utils'

type MediaTitlePosterProps = {
  homepage: null | string
  posterUrl: null | string
  title: string
}

const POSTER_PLACEMENT_CLASSNAME = 'w-24 shrink-0 rounded-md md:col-start-1 md:row-span-2 md:w-40'

export function MediaTitlePoster({ homepage, posterUrl, title }: MediaTitlePosterProps) {
  if (homepage == null) {
    return (
      <MediaPoster
        className={cn(POSTER_PLACEMENT_CLASSNAME, 'shadow-lg')}
        fallbackIconClassName="size-6"
        ratio={2 / 3}
        sizes="160px"
        src={posterUrl}
      />
    )
  }

  return (
    <Link
      aria-label={`${title} official website`}
      className={cn(
        POSTER_PLACEMENT_CLASSNAME,
        'group relative block ring-2 ring-transparent transition-shadow hover:ring-foreground/70 focus-visible:ring-foreground/70 focus-visible:outline-none',
      )}
      href={homepage}
      rel="noopener noreferrer"
      target="_blank"
    >
      <MediaPoster
        className="w-full rounded-md shadow-lg transition-[filter] duration-200 group-hover:grayscale-25 group-focus-visible:grayscale-25"
        fallbackIconClassName="size-6"
        ratio={2 / 3}
        sizes="160px"
        src={posterUrl}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-md bg-background/45 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        <ExternalLink className="size-6" />
      </span>
    </Link>
  )
}
