import Image from 'next/image'

type MediaTitleHeroBackdropProps = {
  backdropUrl: null | string
}

export function MediaTitleHeroBackdrop({ backdropUrl }: MediaTitleHeroBackdropProps) {
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
