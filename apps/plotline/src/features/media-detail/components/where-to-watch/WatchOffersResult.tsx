import { TitleWatchOffers } from '../../types'
import { ExternalWatchLink } from './ExternalWatchLink'
import { JustWatchCredit } from './JustWatchCredit'
import { WatchOfferGroups } from './WatchOfferGroups'

type WatchOffersResultProps = {
  offers: TitleWatchOffers
  region: string
}

export function WatchOffersResult({ offers, region }: WatchOffersResultProps) {
  const regionOffers = offers[region]
  const groups = regionOffers?.groups ?? []
  const link = regionOffers?.link

  return (
    <div className="flex flex-col gap-3">
      {groups.length > 0 ? (
        <WatchOfferGroups groups={groups} />
      ) : (
        <p className="text-sm text-muted-foreground">No streaming options in {region}.</p>
      )}
      <ExternalWatchLink link={link} />
      <JustWatchCredit />
    </div>
  )
}
