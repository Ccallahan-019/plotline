import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShowIf } from '@/components/utils/ShowIf'

import type { WatchlistCard as WatchlistCardData } from '../types'

import { WatchlistVisibilityBadge } from '../../components/WatchlistVisibilityBadge'
import { formatWatchlistTitleCount } from '../../services/format-watchlist-title-count'
import { ChallengeCardProgress } from './ChallengeCardProgress'
import { WatchlistPosterStack } from './WatchlistPosterStack'

type WatchlistGridCardProps = {
  card: WatchlistCardData
}

export function WatchlistGridCard({ card }: WatchlistGridCardProps) {
  const isChallenge = card.challenge?.enabled === true
  const href = isChallenge
    ? `/dashboard/challenges/${card.slug}`
    : `/dashboard/watchlists/${card.slug}`

  const badgeContent = isChallenge ? 'Challenge' : 'Watchlist'

  return (
    <Card>
      <div className="px-(--card-spacing)">
        <WatchlistPosterStack previews={card.previews} />
      </div>
      <CardHeader>
        <Link className="w-fit" href={href}>
          <CardTitle className="line-clamp-2">{card.name}</CardTitle>
        </Link>

        <ShowIf condition={card.description != null}>
          <CardDescription className="line-clamp-3">{card.description}</CardDescription>
        </ShowIf>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{badgeContent}</Badge>
          <WatchlistVisibilityBadge variant="outline" visibility={card.visibility} />
          <p className="text-sm leading-none text-muted-foreground">
            {formatWatchlistTitleCount(card.titleCount)}
          </p>
        </div>

        <ShowIf condition={isChallenge}>
          <ChallengeCardProgress card={card} />
        </ShowIf>
      </CardContent>
    </Card>
  )
}
