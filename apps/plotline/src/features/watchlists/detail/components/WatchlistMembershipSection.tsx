import { Watchlist, WatchlistMembership } from '@plotline/payload-types'

import { Spinner } from '@/components/ui/spinner'
import { ErrorEmpty } from '@/components/utils/ErrorEmpty'

import { MembershipLayout } from '../hooks/use-membership-layout'
import { WatchlistMembershipSort } from '../types'
import { WatchlistMembershipList } from './WatchlistMembershipList'
import { WatchlistMembershipsEmpty } from './WatchlistMembershipsEmpty'

const ERROR_EMPTY_PROPS = {
  description: 'Ensure the payload app is running and service credentials are configured.',
  title: 'Could not load titles',
}

type WatchlistMembershipSectionProps = {
  challenge: null | Watchlist['challenge']
  errorMessage: null | string
  isPending: boolean
  layout: MembershipLayout | null
  memberships: undefined | WatchlistMembership[]
  onAddTitle: () => void
  showGoalCounts: boolean
  slug: string
  sort: WatchlistMembershipSort
}

export function WatchlistMembershipSection({
  challenge,
  errorMessage,
  isPending,
  layout,
  memberships,
  onAddTitle,
  showGoalCounts,
  slug,
  sort,
}: WatchlistMembershipSectionProps) {
  if (memberships) {
    return (
      <WatchlistMembershipList
        challenge={challenge}
        layout={layout}
        memberships={memberships}
        onAddTitle={onAddTitle}
        showGoalCounts={showGoalCounts}
        slug={slug}
        sort={sort}
      />
    )
  }

  if (isPending) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="size-7" />
      </div>
    )
  }

  if (errorMessage) {
    return <ErrorEmpty {...ERROR_EMPTY_PROPS} errorMessage={errorMessage} />
  }

  return <WatchlistMembershipsEmpty onAddTitle={onAddTitle} />
}
