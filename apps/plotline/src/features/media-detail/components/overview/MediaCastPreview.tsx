import { ChevronRight } from 'lucide-react'

import { AvatarGroup } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ShowIf } from '@/components/utils/ShowIf'

import type { MediaTitleCastMember } from '../../types'

import { MediaCastAvatar } from '../cast/MediaCastAvatar'

const PREVIEW_COUNT = 8

type MediaCastPreviewProps = {
  cast: MediaTitleCastMember[]
  onShowCast: () => void
}

export function MediaCastPreview({ cast, onShowCast }: MediaCastPreviewProps) {
  const preview = cast.slice(0, PREVIEW_COUNT)

  if (preview.length === 0) {
    return null
  }

  return (
    <section className="hidden flex-col gap-3 md:flex">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-heading text-base font-medium">Cast</h2>
        <Button onClick={onShowCast} size="sm" type="button" variant="ghost">
          Full Cast & Crew
          <ChevronRight />
        </Button>
      </div>
      <AvatarGroup className="gap-x-8 gap-y-4 flex-wrap">
        {preview.map((member) => (
          <li className="w-20 shrink-0 flex flex-col items-center" key={member.id}>
            <MediaCastAvatar initials={member.initials} profilePath={member.profilePath} />
            <p className="mt-2 line-clamp-2 text-xs font-medium text-center">{member.name}</p>
            <ShowIf condition={member.character != null}>
              <p className="text-xs text-muted-foreground text-center">{member.character}</p>
            </ShowIf>
          </li>
        ))}
      </AvatarGroup>
    </section>
  )
}
