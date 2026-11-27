'use client'

import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures'
import { ChevronRight } from 'lucide-react'
import { useRef } from 'react'

import { Button } from '@/components/ui/button'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  useCarousel,
} from '@/components/ui/carousel'
import { Item, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item'
import { ShowIf } from '@/components/utils/ShowIf'

import type { MediaTitleCastMember } from '../../types'

import { MediaCastAvatar } from '../cast/MediaCastAvatar'

/** Several billed cast members per page, flush with the start of the rail. */
const castCarouselOptions = {
  align: 'start',
  containScroll: 'trimSnaps',
  slidesToScroll: 'auto',
} as const

type MediaCastPreviewCardProps = {
  member: MediaTitleCastMember
}

type MediaCastPreviewProps = {
  cast: MediaTitleCastMember[]
  onShowCast: () => void
}

export function MediaCastPreview({ cast, onShowCast }: MediaCastPreviewProps) {
  function handleShowCast() {
    onShowCast()
  }

  const wheelGestures = useRef(WheelGesturesPlugin())

  if (cast.length === 0) {
    return null
  }

  return (
    <section className="hidden min-w-0 md:block">
      <Carousel
        aria-labelledby="media-cast-preview-heading"
        className="flex w-full min-w-0 flex-col gap-3"
        opts={castCarouselOptions}
        plugins={[wheelGestures.current]}
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-heading text-base font-medium" id="media-cast-preview-heading">
            Cast
          </h2>
          <div className="flex shrink-0 items-center gap-1">
            <CarouselPrevious className="static my-0" />
            <CarouselNext className="static my-0" />
            <Button onClick={handleShowCast} size="sm" type="button" variant="ghost">
              Full Cast & Crew
              <ChevronRight />
            </Button>
          </div>
        </div>
        <div className="relative">
          <CarouselContent>
            {cast.map((member) => (
              <CarouselItem className="basis-auto" key={member.id}>
                <MediaCastPreviewCard member={member} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <MediaCastPreviewEdge />
        </div>
      </Carousel>
    </section>
  )
}

function MediaCastPreviewCard({ member }: MediaCastPreviewCardProps) {
  const { character, name, profilePath } = member

  return (
    <Item className="flex-col items-start w-32 p-0" size="xs">
      <MediaCastAvatar profilePath={profilePath} />
      <ItemContent>
        <ItemTitle className="line-clamp-2">{name}</ItemTitle>
        <ShowIf condition={character != null}>
          <ItemDescription className="line-clamp-2">{character}</ItemDescription>
        </ShowIf>
      </ItemContent>
    </Item>
  )
}

function MediaCastPreviewEdge() {
  const { canScrollNext } = useCarousel()

  return (
    <ShowIf condition={canScrollNext}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-14 bg-linear-to-l from-background to-transparent"
      />
    </ShowIf>
  )
}
