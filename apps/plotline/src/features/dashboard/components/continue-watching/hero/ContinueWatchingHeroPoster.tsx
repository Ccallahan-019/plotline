import { MediaPoster } from '@/components/media/MediaPoster'
import { Badge } from '@/components/ui/badge'
import { ShowIf } from '@/components/utils/ShowIf'

type ContinueWatchingHeroPosterProps = {
  src: null | string
  stalledLabel: null | string
}

export function ContinueWatchingHeroPoster({ src, stalledLabel }: ContinueWatchingHeroPosterProps) {
  return (
    <div className="relative w-32 shrink-0">
      <MediaPoster alt="" className="rounded-md" ratio={2 / 3} sizes="128px" src={src} />
      <ShowIf condition={stalledLabel != null}>
        <Badge
          className="absolute top-2 left-2 max-w-[calc(100%-1rem)] border-amber-500/40 bg-background/95 text-amber-700 shadow-sm dark:text-amber-300"
          variant="outline"
        >
          {stalledLabel}
        </Badge>
      </ShowIf>
    </div>
  )
}
