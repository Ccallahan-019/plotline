import { auth } from '@clerk/nextjs/server'
import { notFound, redirect } from 'next/navigation'

import { WatchlistEditor } from '@/features/watchlists/components/WatchlistEditor'
import { getWatchlistBySlug } from '@/features/watchlists/services/get-watchlists'

type EditWatchlistPageProps = {
  params: Promise<{ slug: string }>
}

export default async function EditWatchlistPage({ params }: EditWatchlistPageProps) {
  const { slug } = await params
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const watchlist = await getWatchlistBySlug(userId, slug)

  if (!watchlist) {
    notFound()
  }

  return <WatchlistEditor mode="edit" watchlist={watchlist} />
}

export async function generateMetadata({ params }: EditWatchlistPageProps) {
  const { slug } = await params
  const { userId } = await auth()

  if (!userId) {
    return { title: 'Edit Watchlist' }
  }

  try {
    const watchlist = await getWatchlistBySlug(userId, slug)

    return { title: watchlist ? `Edit ${watchlist.name}` : 'Edit Watchlist' }
  } catch {
    return { title: 'Edit Watchlist' }
  }
}
