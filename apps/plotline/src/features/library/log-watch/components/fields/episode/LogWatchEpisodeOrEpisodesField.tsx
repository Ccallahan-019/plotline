import { Media } from '@plotline/payload-types'

import { LogWatchFormApi } from '../../../hooks/use-log-watch-form'
import { LogWatchEpisodeField } from './LogWatchEpisodeField'
import { LogWatchEpisodesField } from './LogWatchEpisodesField'

type LogWatchEpisodeOrEpisodesFieldProps = {
  disabled?: boolean
  episodeMode?: 'multi' | 'single'
  form: LogWatchFormApi
  media: Media
}

export function LogWatchEpisodeOrEpisodesField({
  disabled,
  episodeMode,
  form,
  media,
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
    />
  )
}
