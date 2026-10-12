import { auth } from '@clerk/nextjs/server'
import { notFound, redirect } from 'next/navigation'

import { WatchlistDetail } from '@/features/watchlists/detail/components/WatchlistDetail'
import { loadWatchlistDetail } from '@/features/watchlists/detail/services/load-watchlist-detail'
import { getWatchlistBySlug } from '@/features/watchlists/services/get-watchlists'

type ChallengeDetailPageProps = {
  params: Promise<{ slug: string }>
}

export default async function ChallengeDetailPage({ params }: ChallengeDetailPageProps) {
  const { slug } = await params
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const detail = await loadWatchlistDetail(userId, slug)

  if (detail.kind === 'missing') {
    notFound()
  }

  if (detail.watchlist.challenge?.enabled !== true) {
    redirect(`/dashboard/watchlists/${encodeURIComponent(slug)}`)
  }

  return (
    <WatchlistDetail
      initialMemberships={detail.memberships}
      initialMembershipsError={detail.membershipsError}
      initialWatchlist={detail.watchlist}
      slug={slug}
    />
  )
}

export async function generateMetadata({ params }: ChallengeDetailPageProps) {
  const { slug } = await params
  const { userId } = await auth()

  if (!userId) {
    return { title: 'Challenge' }
  }

  try {
    const watchlist = await getWatchlistBySlug(userId, slug)

    return { title: watchlist?.name ?? 'Challenge' }
  } catch {
    return { title: 'Challenge' }
  }
}
