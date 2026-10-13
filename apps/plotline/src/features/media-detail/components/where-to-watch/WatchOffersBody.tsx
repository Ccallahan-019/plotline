import { UseQueryResult } from '@tanstack/react-query'

import { TitleWatchOffers } from '../../types'
import { WatchOffersError } from './WatchOffersError'
import { WatchOffersLoading } from './WatchOffersLoading'
import { WatchOffersResult } from './WatchOffersResult'

type WatchOffersBodyProps = {
  query: UseQueryResult<TitleWatchOffers>
  region: string
}

export function WatchOffersBody({ query, region }: WatchOffersBodyProps) {
  if (query.data) {
    return <WatchOffersResult offers={query.data} region={region} />
  }

  if (query.isError) {
    return (
      <WatchOffersError
        isFetching={query.isFetching}
        onRetry={() => {
          void query.refetch()
        }}
      />
    )
  }

  // A disabled query (invalid title id) never fetches, so it must not show a spinner forever.
  if (query.fetchStatus === 'idle') {
    return <WatchOffersResult offers={{}} region={region} />
  }

  return <WatchOffersLoading />
}
