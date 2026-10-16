import { CardDescription } from '@/components/ui/card'
import { DashboardRecommendations } from '@/features/dashboard/types'

type DashboardRecommendationsCardDescriptionProps = {
  recommendations: DashboardRecommendations | undefined
}

export function DashboardRecommendationsCardDescription({
  recommendations,
}: DashboardRecommendationsCardDescriptionProps) {
  if (!recommendations) return null

  return <CardDescription>{recommendationReason(recommendations)}</CardDescription>
}

function recommendationReason(data: DashboardRecommendations): string {
  const titles = data.seeds.map((seed) => seed.title)
  const list =
    titles.length <= 1 ? (titles[0] ?? 'what you have watched') : `${titles[0]} and ${titles[1]}`

  if (data.reason === 'rated') {
    return `Because you rated ${list}`
  }

  return `Because you finished ${list}`
}
