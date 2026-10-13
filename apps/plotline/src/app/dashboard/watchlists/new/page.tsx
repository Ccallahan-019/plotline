import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

import { WatchlistEditor } from '@/features/watchlists/editor/components/WatchlistEditor'

export const metadata = {
  title: 'New watchlist',
}

type NewWatchlistPageProps = {
  searchParams: Promise<{ challenge?: string | string[] }>
}

export default async function NewWatchlistPage({ searchParams }: NewWatchlistPageProps) {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const params = await searchParams
  const challenge = params.challenge
  const challengeEnabled = challenge === '1' || (Array.isArray(challenge) && challenge.includes('1'))

  return <WatchlistEditor challengeEnabled={challengeEnabled} mode="create" />
}
