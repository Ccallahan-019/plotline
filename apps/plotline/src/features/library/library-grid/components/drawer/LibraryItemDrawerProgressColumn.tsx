import { Field, FieldLabel } from '@/components/ui/field'
import { Progress } from '@/components/ui/progress'

import {
  formatBoolean,
  formatEpisodeProgressLabel,
  formatNumber,
  formatSeasonsCompleted,
  getEpisodeProgressValue,
} from '../../services/drawer-helpers'
import { LibraryItemDrawerViewModel } from '../../types'
import { LibraryItemDrawerField } from './LibraryItemDrawerField'
import { LibraryItemDrawerSection } from './LibraryItemDrawerSection'

type LibraryItemDrawerProgressColumnProps = {
  viewModel: LibraryItemDrawerViewModel
}

export function LibraryItemDrawerProgressColumn({
  viewModel,
}: LibraryItemDrawerProgressColumnProps) {
  if (viewModel.progress.type === 'movie') {
    return (
      <div className="flex flex-col gap-4">
        <LibraryItemDrawerSection title="Progress">
          <LibraryItemDrawerField
            label="Watched"
            value={formatBoolean(viewModel.progress.watched)}
          />
        </LibraryItemDrawerSection>
      </div>
    )
  }

  const { episodesWatched, lastEpisode, lastSeason, seasonsCompleted } = viewModel.progress
  const progressValue = getEpisodeProgressValue(episodesWatched, viewModel.episodeCount)

  return (
    <div className="flex flex-col gap-4">
      <LibraryItemDrawerSection title="Progress">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <Field>
              <Progress id="episode-progress" value={progressValue ?? 0} />
              <FieldLabel className="text-xs text-muted-foreground" htmlFor="episode-progress">
                {formatEpisodeProgressLabel(episodesWatched, viewModel.episodeCount)} episodes
              </FieldLabel>
            </Field>
          </div>

          <div className="grid gap-2">
            <LibraryItemDrawerField label="Last Season" value={formatNumber(lastSeason)} />
            <LibraryItemDrawerField label="Last Episode" value={formatNumber(lastEpisode)} />
            <LibraryItemDrawerField
              label="Episodes Watched"
              value={formatNumber(episodesWatched)}
            />
            <LibraryItemDrawerField
              label="Seasons Completed"
              value={formatSeasonsCompleted(seasonsCompleted)}
            />
          </div>
        </div>
      </LibraryItemDrawerSection>
    </div>
  )
}
