import { UserRound } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import { mediaImageUrl } from '../../services/media-image-url'

type MediaCastAvatarProps = {
  initials: string
  profilePath: null | string
}

export function MediaCastAvatar({ initials, profilePath }: MediaCastAvatarProps) {
  const src = mediaImageUrl(profilePath, 'w185')

  return (
    <Avatar className="size-18">
      {src ? <AvatarImage alt="" src={src} /> : null}
      <AvatarFallback className="text-base font-medium">
        {initials || <UserRound aria-hidden />}
      </AvatarFallback>
    </Avatar>
  )
}
