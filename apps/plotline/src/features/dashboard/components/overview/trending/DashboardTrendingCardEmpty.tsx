import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'

export function DashboardTrendingCardEmpty() {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyTitle>No Trending Titles</EmptyTitle>
        <EmptyDescription>
          There are no trending titles right now. Check back later.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
