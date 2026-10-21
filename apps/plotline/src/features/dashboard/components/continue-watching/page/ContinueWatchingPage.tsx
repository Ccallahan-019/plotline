'use client'

import type { LibraryItemsResponse } from '@/features/library/library-grid/types'

import { PageHeading } from '@/components/pages/PageHeading'
import { useContinueWatchingPage } from '@/features/dashboard/hooks/use-continue-watching-page'
import { alsoInProgressCountLabel } from '@/features/dashboard/services/continue-watching'

import { DashboardWidgetError } from '../../state/DashboardWidgetError'
import { DashboardWidgetSkeleton } from '../../state/DashboardWidgetSkeleton'
import { AlsoInProgressContent } from '../also-in-progress/AlsoInProgressContent'
import { AlsoInProgressFilter } from '../also-in-progress/AlsoInProgressFilter'
import { ContinueWatchingHeroCard } from '../hero/ContinueWatchingHeroCard'
import { ContinueWatchingEmpty } from './ContinueWatchingEmpty'
import { ContinueWatchingSortSelector } from './ContinueWatchingSortSelector'

type ContinueWatchingPageProps = {
  initialData?: LibraryItemsResponse
}

export function ContinueWatchingPage({ initialData }: ContinueWatchingPageProps) {
  return (
    <div className="flex flex-col gap-4">
      <PageHeading
        description="Series and films you've started but not finished."
        title="Continue watching"
      />
      <ContinueWatchingBody initialData={initialData} />
    </div>
  )
}

function ContinueWatchingBody({ initialData }: ContinueWatchingPageProps) {
  const {
    alsoInProgress,
    counts,
    hero,
    libraryItems,
    mediaType,
    query,
    setMediaType,
    setSort,
    sort,
  } = useContinueWatchingPage({ initialData })
  const { data, isError, isLoading, refetch } = query

  function handleRetry() {
    void refetch()
  }

  if (isLoading) {
    return <DashboardWidgetSkeleton className="h-64" />
  }

  if (isError) {
    return (
      <DashboardWidgetError message="Couldn't load what you're watching." onRetry={handleRetry} />
    )
  }

  if (!data || !hero) {
    return <ContinueWatchingEmpty />
  }

  return (
    <div className="flex flex-col gap-6">
      <ContinueWatchingHeroCard hero={hero} libraryItem={libraryItems.get(hero.id)} />

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <h2 className="font-heading text-lg font-medium">Also In Progress</h2>
            <p className="text-sm text-muted-foreground">
              {alsoInProgressCountLabel(alsoInProgress.length)}
            </p>
          </div>
          <ContinueWatchingSortSelector setSort={setSort} sort={sort} />
        </div>
        <AlsoInProgressFilter counts={counts} mediaType={mediaType} setMediaType={setMediaType} />
        <AlsoInProgressContent
          alsoInProgress={alsoInProgress}
          libraryItems={libraryItems}
          mediaType={mediaType}
        />
      </section>
    </div>
  )
}
