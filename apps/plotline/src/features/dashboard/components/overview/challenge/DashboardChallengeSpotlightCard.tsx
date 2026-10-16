import { ButtonLink } from '@/components/buttons/ButtonLink'
import { MediaBackdropCard } from '@/components/media/MediaBackdropCard'
import { Badge } from '@/components/ui/badge'
import {
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ShowIf } from '@/components/utils/ShowIf'
import {
  ChallengeSpotlightPaceBadge,
  getChallengeSpotlightLegend,
  getChallengeSpotlightPaceBadge,
} from '@/features/dashboard/services/challenge-spotlight'
import { titleBackdropUrl } from '@/features/media-detail/services/media-image-url'
import { getChallengeCardView } from '@/features/watchlists/cards/services/challenge-card'
import { WatchlistCard } from '@/features/watchlists/cards/types'
import { cn } from '@/lib/utils'

import { DashboardChallengeSpotlightPaceBadge } from './DashboardChallengeSpotlightPaceBadge'
import { DashboardChallengeSpotlightStats } from './DashboardChallengeSpotlightStats'

type DashboardChallengeSpotlightCardProps = {
  card: WatchlistCard
}

export function DashboardChallengeSpotlightCard({ card }: DashboardChallengeSpotlightCardProps) {
  const view = getChallengeCardView(card)
  const legend = getChallengeSpotlightLegend(card)
  const paceBadge = getChallengeSpotlightPaceBadge(card.statsCache)
  const destructive = view.paceTone === 'destructive'
  const showDescription = legend.daysLeftLabel != null

  const description = [view.progressLabel, legend.daysLeftLabel].filter(Boolean).join(' · ')

  const coverUrl = titleBackdropUrl(card.coverPath)

  return (
    <MediaBackdropCard
      backdropUrl={coverUrl}
      imageSizes="280px"
      size="sm"
      wrapperClassName="lg:max-xl:w-1/3"
    >
      <CardHeader>
        <CardTitle className="line-clamp-2 min-w-0">{card.name}</CardTitle>

        <ShowIf condition={showDescription || paceBadge != null}>
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <ShowIf condition={showDescription}>
              <CardDescription>{description}</CardDescription>
            </ShowIf>
            <PaceBadge paceBadge={paceBadge} />
          </div>
        </ShowIf>
        <CardAction>
          <Badge variant="secondary">Challenge Mode</Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Progress
          aria-label={view.progressLabel}
          className="gap-2"
          indicatorClassName={cn(destructive && 'bg-destructive')}
          max={100}
          trackClassName="h-1.5"
          value={view.percentComplete}
        />
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <DashboardChallengeSpotlightStats
            completedLabel={legend.completedLabel}
            destructive={destructive}
            perWeekLabel={legend.perWeekLabel}
            requiredPaceLabel={legend.requiredPaceLabel}
          />
          <ButtonLink href={`/dashboard/challenges/${card.slug}`} size="sm" variant="outline">
            View Challenge
          </ButtonLink>
        </div>
      </CardContent>
    </MediaBackdropCard>
  )
}

function PaceBadge({ paceBadge }: { paceBadge: ChallengeSpotlightPaceBadge | null }) {
  if (paceBadge == null) return null

  return <DashboardChallengeSpotlightPaceBadge label={paceBadge.label} tone={paceBadge.tone} />
}
