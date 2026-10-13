import { Field, FieldContent, FieldLabel } from '@/components/ui/field'
import { Skeleton } from '@/components/ui/skeleton'

import { LogWatchFormApi } from '../../../hooks/use-log-watch-form'
import { useTvSeasonEpisodes } from '../../../hooks/use-tv-season-episodes'
import { syncQuickLogEpisode, toEpisodeSelectItems } from '../../../services/episode-field'

export function EpisodeNumberField({
  disabled,
  form,
  hasTmdbId,
  season,
  tmdbId,
}: {
  disabled: boolean
  form: LogWatchFormApi
  hasTmdbId: boolean
  season: number
  tmdbId?: null | number
}) {
  const { data, isError, isPending } = useTvSeasonEpisodes(tmdbId, season, {
    enabled: hasTmdbId,
  })

  const tmdbEpisodes = data?.episodes ?? []
  const showTmdbEpisodeSelect = hasTmdbId && !isError
  // Empty TMDB seasons still need the numeric field; otherwise the select has no options.
  const isEmptyTmdbSeason = showTmdbEpisodeSelect && tmdbEpisodes.length === 0

  if (isPending) {
    return <Skeleton className="h-8 w-full" />
  }

  return (
    <form.AppField
      listeners={{
        onChange: () => {
          syncQuickLogEpisode(form)
        },
      }}
      name="episode.episode"
    >
      {(field) => (
        <Field className="items-center!" data-disabled={disabled} orientation="horizontal">
          <FieldLabel className="max-w-20">Episode</FieldLabel>
          <FieldContent className="min-w-0">
            {showTmdbEpisodeSelect && !isEmptyTmdbSeason ? (
              <field.SelectField
                align="start"
                aria-label="Episode"
                disabled={disabled}
                items={toEpisodeSelectItems(season, tmdbEpisodes)}
              />
            ) : (
              <field.NumberField aria-label="Episode" disabled={disabled} min={0} />
            )}
          </FieldContent>
          <field.FormFieldError />
        </Field>
      )}
    </form.AppField>
  )
}
