import { Item, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item'
import { ShowIf } from '@/components/utils/ShowIf'

import type { MediaTitleCreditCard } from '../../types'

import { MediaCastAvatar } from './MediaCastAvatar'

type MediaCreditListItemProps = {
  member: MediaTitleCreditCard
}

export function MediaCreditListItem({ member }: MediaCreditListItemProps) {
  const { name, profilePath, subtitle } = member

  return (
    <li className="min-w-0">
      <Item className="flex-col items-start h-full p-0">
        <MediaCastAvatar profilePath={profilePath} />
        <ItemContent className="min-w-0 gap-0">
          <ItemTitle className="line-clamp-2">{name}</ItemTitle>
          <ShowIf condition={subtitle != null}>
            <ItemDescription className="line-clamp-2">{subtitle}</ItemDescription>
          </ShowIf>
        </ItemContent>
      </Item>
    </li>
  )
}
