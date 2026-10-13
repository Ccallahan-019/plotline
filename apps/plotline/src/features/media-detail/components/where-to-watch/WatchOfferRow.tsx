import Image from 'next/image'

import { Item, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item'

import { mediaImageUrl } from '../../services/media-image-url'

type WatchOfferRowProps = {
  logoPath: null | string
  name: string
}

export function WatchOfferRow({ logoPath, name }: WatchOfferRowProps) {
  return (
    <Item size="xs" variant="outline">
      <ItemMedia variant="image">
        <WatchOfferLogo logoPath={logoPath} />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{name}</ItemTitle>
      </ItemContent>
    </Item>
  )
}

function WatchOfferLogo({ logoPath }: { logoPath: null | string }) {
  const logoUrl = mediaImageUrl(logoPath, 'w92')

  if (!logoUrl) {
    return <div className="h-10 w-10 bg-muted" />
  }

  return <Image alt="" className="h-10 w-10" height={40} src={logoUrl} width={40} />
}
