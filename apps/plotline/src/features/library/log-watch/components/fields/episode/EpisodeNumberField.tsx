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

  const showTmdbEpisodeSelect = hasTmdbId && !isError

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
        <Field data-disabled={disabled}>
          <FieldLabel>Episode</FieldLabel>
          <FieldContent>
            {showTmdbEpisodeSelect ? (
              <field.SelectField
                aria-label="Episode"
                disabled={disabled}
                items={toEpisodeSelectItems(season, data?.episodes ?? [])}
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
