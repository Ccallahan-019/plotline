import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item'
import { ShowIf } from '@/components/utils/ShowIf'

import type { MediaTitleCreditCard } from '../../types'

import { MediaCastAvatar } from './MediaCastAvatar'

type MediaCreditListItemProps = {
  member: MediaTitleCreditCard
}

export function MediaCreditListItem({ member }: MediaCreditListItemProps) {
  return (
    <li>
      <Item className="p-0 flex-nowrap">
        <ItemMedia>
          <MediaCastAvatar initials={member.initials} profilePath={member.profilePath} />
        </ItemMedia>

        <ItemContent className="min-w-0">
          <ItemTitle className="w-auto truncate line-clamp-1">{member.name}</ItemTitle>
          <ShowIf condition={member.subtitle != null}>
            <ItemDescription className="w-auto truncate line-clamp-1">
              {member.subtitle}
            </ItemDescription>
          </ShowIf>
        </ItemContent>
      </Item>
    </li>
  )
}
