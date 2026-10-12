'use client'

import type { Watchlist } from '@plotline/payload-types'

import { useRouter } from 'nextjs-toploader/app'

import { Item, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item'

import { useWatchlistForm } from '../hooks/use-watchlist-form'
import { watchlistFormDescription, watchlistFormTitle } from '../services/watchlist-form'
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

  const coverFallback = props.mode === 'edit' ? coverOptionFromWatchlist(props.watchlist) : null

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <Item className="px-0">
        <ItemContent>
          <form.Subscribe selector={(state) => state.values.challengeEnabled}>
            {(challengeEnabled) => {
              const title = watchlistFormTitle(props.mode, challengeEnabled)
              const description = watchlistFormDescription(props.mode, challengeEnabled)

              return (
                <>
                  <ItemTitle className="text-2xl">{title}</ItemTitle>
                  <ItemDescription>{description}</ItemDescription>
                </>
              )
            }}
          </form.Subscribe>
        </ItemContent>
      </Item>

      <WatchlistForm
        coverFallback={coverFallback}
        form={form}
        isSubmitting={isSubmitting}
        isSystem={isSystem}
        mode={props.mode}
        onCancel={() => router.push(cancelHref)}
      />
    </div>
  )
}

// Challenge lists open on the challenges surface. Regular lists stay under watchlists.
function watchlistDetailPath(watchlist: Pick<Watchlist, 'challenge' | 'slug'>): string {
  const root = watchlist.challenge?.enabled ? '/dashboard/challenges' : '/dashboard/watchlists'

  return `${root}/${encodeURIComponent(watchlist.slug)}`
}
