'use client'

import type { MediaType } from '@plotline/shared/constants'

import { useSyncTitleBreadcrumb } from '@/features/navigation/breadcrumbs/hooks/use-sync-title-breadcrumb'

import type { MediaTitlePageData } from '../types'

import { useMediaTitlePage } from '../hooks/use-media-title-page'
import { MediaTitleHero } from './hero/MediaTitleHero'
import { MediaTitleTabs } from './MediaTitleTabs'

type MediaTitlePageProps = {
  initialData: MediaTitlePageData
  mediaType: MediaType
  tmdbId: number
}

export function MediaTitlePage({ initialData, mediaType, tmdbId }: MediaTitlePageProps) {
  const query = useMediaTitlePage(mediaType, tmdbId, initialData)
  const data = query.data
  useSyncTitleBreadcrumb(`/dashboard/title/${mediaType}/${tmdbId}`, data.media.title)

  return (
    <div className="-mx-8 -mt-8 flex flex-col">
      <MediaTitleHero data={data} />
      <div className="px-4 py-6 md:px-8 md:pb-8">
        <MediaTitleTabs data={data} />
      </div>
    </div>
  )
}
