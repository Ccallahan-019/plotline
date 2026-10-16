'use client'

import { useState } from 'react'

import type { LibraryItemsResponse } from '@/features/library/library-grid/types'

import { PageHeading } from '@/components/pages/PageHeading'
import { ContinueWatchingEmpty } from '@/features/dashboard/components/continue-watching/ContinueWatchingEmpty'
import { ContinueWatchingHeroCard } from '@/features/dashboard/components/continue-watching/ContinueWatchingRows'
import { useContinueWatchingRows } from '@/features/dashboard/hooks/use-continue-watching-items'
import {
  buildContinueWatchingView,
  type ContinueWatchingSort,
  type ContinueWatchingTypeFilter,
} from '@/features/dashboard/services/continue-watching'

import { DashboardWidgetError } from '../state/DashboardWidgetError'
import { DashboardWidgetSkeleton } from '../state/DashboardWidgetSkeleton'
import { AlsoInProgessContent } from './AlsoInProgessContent'
import { AlsoInProgressFilter } from './AlsoInProgressFilter'
import { ContinueWatchingSortSelector } from './ContinueWatchingSortSelector'

type ContinueWatchingPageProps = {
  initialData?: LibraryItemsResponse
}

export function ContinueWatchingPage({ initialData }: ContinueWatchingPageProps) {
  return (
    <div className="flex flex-col gap-4">
      <PageHeading
        description="The title that has been waiting longest comes first when something is stalled."
        title="Continue Watching"
      />
      <ContinueWatchingBody initialData={initialData} />
    </div>
  )
}

function ContinueWatchingBody({ initialData }: ContinueWatchingPageProps) {
  const [mediaType, setMediaType] = useState<ContinueWatchingTypeFilter>('all')
  const [sort, setSort] = useState<ContinueWatchingSort>('last-watched')

  const { libraryItems, query, rows } = useContinueWatchingRows({ initialData })
  const { data, isError, isLoading, refetch } = query

  const { alsoInProgress, counts, hero } = buildContinueWatchingView(rows, { mediaType, sort })

  if (isLoading) {
    return <DashboardWidgetSkeleton className="h-64" />
  }

  if (isError) {
    const handleRetry = () => {
      void refetch()
    }

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
          <h2 className="font-heading font-medium text-lg">Also In Progress</h2>
          <ContinueWatchingSortSelector setSort={setSort} sort={sort} />
        </div>
        <AlsoInProgressFilter counts={counts} mediaType={mediaType} setMediaType={setMediaType} />
        <AlsoInProgessContent
          alsoInProgress={alsoInProgress}
          libraryItems={libraryItems}
          mediaType={mediaType}
        />
      </section>
    </div>
  )
}
