import { ItemGroup } from '@/components/ui/item'

import { TitleWatchOfferGroup } from '../../types'
import { WatchOfferRow } from './WatchOfferRow'

type WatchOfferGroupsProps = {
  groups: TitleWatchOfferGroup[]
}

export function WatchOfferGroups({ groups }: WatchOfferGroupsProps) {
  return (
    <div className="flex flex-col gap-4">
      {groups.map((group) => (
        <div className="flex flex-col gap-2" key={group.label}>
          <h3 className="text-xs font-medium text-muted-foreground">{group.label}</h3>
          <ItemGroup className="gap-2">
            {group.offers.map((offer) => (
              <WatchOfferRow key={offer.providerId} logoPath={offer.logoPath} name={offer.name} />
            ))}
          </ItemGroup>
        </div>
      ))}
    </div>
  )
}
