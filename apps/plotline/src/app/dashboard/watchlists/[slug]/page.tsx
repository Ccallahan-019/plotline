import { auth } from '@clerk/nextjs/server'
import { notFound, redirect } from 'next/navigation'

import { WatchlistDetail } from '@/features/watchlists/components/WatchlistDetail'
import { getWatchlistBySlug } from '@/features/watchlists/services/get-watchlists'
import { loadWatchlistDetail } from '@/features/watchlists/services/load-watchlist-detail'

type WatchlistDetailPageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: WatchlistDetailPageProps) {
  const { slug } = await params
  const { userId } = await auth()

  if (!userId) {
    return { title: 'Watchlist' }
  }

  try {
    const watchlist = await getWatchlistBySlug(userId, slug)

    return { title: watchlist?.name ?? 'Watchlist' }
  } catch {
    return { title: 'Watchlist' }
  }
}

export default async function WatchlistDetailPage({ params }: WatchlistDetailPageProps) {
  const { slug } = await params
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const detail = await loadWatchlistDetail(userId, slug)

  if (detail.kind === 'missing') {
    notFound()
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
