import Image from 'next/image'

import { ComboboxItem } from '@/components/ui/combobox'
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item'
import { ShowIf } from '@/components/utils/ShowIf'
import { getPosterUrl } from '@/features/media-grid/grid/services/media-display-helpers'

import { TitleSearchItem } from '../types'

export const TitleSearchComboboxItem = ({ item }: { item: TitleSearchItem }) => {
  const posterUrl = getPosterUrl(item.display.posterPath)
  const hasPoster = posterUrl ? posterUrl.trim().length > 0 : false

  return (
    <ComboboxItem value={item}>
      <Item>
        <ItemMedia variant="image">
          <ShowIf condition={hasPoster}>
            <Image alt={item.display.title} height={60} src={posterUrl ?? ''} width={40} />
          </ShowIf>
        </ItemMedia>
        <ItemContent>
          <ItemTitle className="line-clamp-1">
            {item.display.title} -{' '}
            <span className="text-xs text-muted-foreground">{item.display.releaseDate}</span>
          </ItemTitle>
          <ItemDescription>
            {item.display.mediaType === 'movie' ? 'Film' : 'Series'}
          </ItemDescription>
        </ItemContent>
      </Item>
    </ComboboxItem>
  )
}
