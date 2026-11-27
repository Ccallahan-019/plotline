import Image from 'next/image'

type MediaTitleHeroBackdropProps = {
  backdropUrl: null | string
}

export function MediaTitleHeroBackdrop({ backdropUrl }: MediaTitleHeroBackdropProps) {
  return (
    <div aria-hidden className="absolute inset-0 bg-background">
      {backdropUrl ? (
        <Image alt="" className="object-cover" fill priority sizes="100vw" src={backdropUrl} />
      ) : null}
      <div className="absolute inset-0 bg-background/80" />
    </div>
  )
}
