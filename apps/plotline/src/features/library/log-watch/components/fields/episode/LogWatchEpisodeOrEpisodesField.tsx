import type { Media } from '@plotline/payload-types'

import type { LogWatchFormApi } from '../../../hooks/use-log-watch-form'
import type { LogWatchWatchedCoverage } from '../../../services/episode-field'

import { LogWatchEpisodeField } from './LogWatchEpisodeField'
import { LogWatchEpisodesField } from './LogWatchEpisodesField'

type LogWatchEpisodeOrEpisodesFieldProps = {
  disabled?: boolean
  episodeMode?: 'multi' | 'single'
  form: LogWatchFormApi
  media: Media
  watchedCoverage?: LogWatchWatchedCoverage
}

export function LogWatchEpisodeOrEpisodesField({
  disabled,
  episodeMode,
  form,
  media,
  watchedCoverage,
}: LogWatchEpisodeOrEpisodesFieldProps) {
  if (episodeMode === 'single') {
    return (
      <LogWatchEpisodeField
        disabled={disabled}
        form={form}
        seasonCount={media.tvMeta?.seasonCount}
        tmdbId={media.tmdbId}
      />
    )
  }

  return (
    <LogWatchEpisodesField
      disabled={disabled}
      form={form}
      seasonCount={media.tvMeta?.seasonCount}
      tmdbId={media.tmdbId}
      watchedCoverage={watchedCoverage}
    />
  )
}
