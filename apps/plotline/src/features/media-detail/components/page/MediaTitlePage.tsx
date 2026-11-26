'use client'

import type { MediaType } from '@plotline/shared/constants'

import { LibraryLogWatchDialog } from '@/features/library/log-watch/components/LibraryLogWatchDialog'
import { useSyncTitleBreadcrumb } from '@/features/navigation/breadcrumbs/hooks/use-sync-title-breadcrumb'

import type { MediaTitlePageData } from '../../types'

import { useMediaTitleActions } from '../../hooks/use-media-title-actions'
import { useMediaTitlePage } from '../../hooks/use-media-title-page'
import { MediaTitleHero } from '../hero/MediaTitleHero'
import { MediaTitleTabs } from './MediaTitleTabs'

type MediaTitlePageProps = {
  initialData: MediaTitlePageData
  mediaType: MediaType
  tmdbId: number
}

export function MediaTitlePage({ initialData, mediaType, tmdbId }: MediaTitlePageProps) {
  const query = useMediaTitlePage(mediaType, tmdbId, initialData)
  const data = query.data
  const { media } = data
  const {
    handleLogEpisode,
    handleLogWatchSuccess,
    handleMarkWatched,
    handleStatusChange,
    isPending,
    logWatchEpisode,
    logWatchLibraryItem,
    logWatchOpen,
    logWatchSessionKey,
    logWatchSubmitting,
    setLogWatchOpen,
    setLogWatchSubmitting,
  } = useMediaTitleActions(data)
  useSyncTitleBreadcrumb(`/dashboard/title/${mediaType}/${tmdbId}`, media.title)

  return (
    <>
      <div className="-mx-4 -mt-4 md:-mx-8 md:-my-8 flex flex-col">
        <MediaTitleHero
          data={data}
          isPending={isPending}
          logWatchSubmitting={logWatchSubmitting}
          onMarkWatched={handleMarkWatched}
          onStatusChange={handleStatusChange}
        />
        <div className="px-4 py-4 md:px-8 md:pb-8">
          <MediaTitleTabs
            data={data}
            logWatchSubmitting={logWatchSubmitting}
            onLogEpisode={handleLogEpisode}
          />
        </div>
      </div>

      <LibraryLogWatchDialog
        episode={logWatchEpisode}
        libraryItem={logWatchLibraryItem}
        media={media}
        onLogged={handleLogWatchSuccess}
        onOpenChange={setLogWatchOpen}
        onSubmittingChange={setLogWatchSubmitting}
        open={logWatchOpen}
        sessionKey={logWatchSessionKey}
      />
    </>
  )
}
