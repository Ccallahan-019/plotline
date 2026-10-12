'use client'

import type { Watchlist } from '@plotline/payload-types'

import { useRouter } from 'nextjs-toploader/app'

import { Item, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item'

import { useWatchlistForm } from '../hooks/use-watchlist-form'
import { coverOptionFromWatchlist, WatchlistForm } from './WatchlistForm'

type WatchlistEditorProps =
  | {
      challengeEnabled: boolean
      mode: 'create'
    }
  | {
      mode: 'edit'
      watchlist: Watchlist
    }

export function WatchlistEditor(props: WatchlistEditorProps) {
  const router = useRouter()
  const { form, isSubmitting, isSystem } = useWatchlistForm({
    ...props,
    onSuccess: (watchlist) => {
      router.push(watchlistDetailPath(watchlist))
    },
  })
  const cancelHref =
    props.mode === 'create'
      ? props.challengeEnabled
        ? '/dashboard/challenges'
        : '/dashboard/watchlists'
      : watchlistDetailPath(props.watchlist)
  const title = props.mode === 'create' ? 'New Watchlist' : 'Edit Watchlist'
  const description =
    props.mode === 'create'
      ? 'Name the watchlist, choose who can see it, and optionally turn it into a challenge.'
      : "Change the watchlist's name, visibility, cover, and challenge settings."

  const coverFallback = props.mode === 'edit' ? coverOptionFromWatchlist(props.watchlist) : null
  const submitLabel = props.mode === 'create' ? 'Create Watchlist' : 'Save Changes'

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <Item className="px-0">
        <ItemContent>
          <ItemTitle className="text-2xl">{title}</ItemTitle>
          <ItemDescription>{description}</ItemDescription>
        </ItemContent>
      </Item>

      <WatchlistForm
        coverFallback={coverFallback}
        form={form}
        isSubmitting={isSubmitting}
        isSystem={isSystem}
        onCancel={() => router.push(cancelHref)}
        submitLabel={submitLabel}
      />
    </div>
  )
}

// Challenge lists open on the challenges surface. Regular lists stay under watchlists.
function watchlistDetailPath(watchlist: Pick<Watchlist, 'challenge' | 'slug'>): string {
  const root = watchlist.challenge?.enabled ? '/dashboard/challenges' : '/dashboard/watchlists'

  return `${root}/${encodeURIComponent(watchlist.slug)}`
}
