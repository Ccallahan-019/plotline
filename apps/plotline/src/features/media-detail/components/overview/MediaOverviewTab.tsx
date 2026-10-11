import type { MediaTitlePageData } from '../../types'

import { buildMediaMetadataRows } from '../../services/format-media-title'
import { MediaCastPreview } from './MediaCastPreview'
import { MediaCommunityRatings } from './MediaCommunityRatings'
import { MediaMetadataGrid } from './MediaMetadataGrid'
import { MediaWhereToWatch } from './MediaWhereToWatch'

type MediaOverviewTabProps = {
  data: MediaTitlePageData
  onShowCast: () => void
}

export function MediaOverviewTab({ data, onShowCast }: MediaOverviewTabProps) {
  const overview = data.media.overview?.trim()
  const rows = buildMediaMetadataRows(data)

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
      <div className="flex min-w-0 flex-col gap-8">
        <section className="flex flex-col gap-3">
          <h2 className="font-heading text-lg font-medium">Synopsis</h2>
          <p className="text-sm leading-relaxed text-pretty lg:text-base">
            {overview || 'No overview available.'}
          </p>
        </section>

        <MediaMetadataGrid rows={rows} />
        <MediaCastPreview cast={data.cast} onShowCast={onShowCast} />
      </div>

      <div className="flex flex-col gap-6">
        <MediaWhereToWatch region={data.region} />
        <MediaCommunityRatings voteAverage={data.voteAverage} voteCount={data.voteCount} />
      </div>
    </div>
  )
}
