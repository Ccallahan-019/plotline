import Image from 'next/image'

import { titleBackdropUrl } from '../../services/media-image-url'

type MediaTitleHeroBackdropProps = {
  backdropPath?: null | string
}

export function MediaTitleHeroBackdrop({ backdropPath }: MediaTitleHeroBackdropProps) {
  const backdropUrl = backdropPath ? titleBackdropUrl(backdropPath) : null

  return (
    <div className="relative h-72 overflow-hidden md:block">
      {backdropUrl ? (
        <Image alt="" className="object-cover" fill sizes="100vw" src={backdropUrl} />
      ) : (
        <div className="absolute inset-0 bg-muted" />
      )}
    </div>
  )
}
