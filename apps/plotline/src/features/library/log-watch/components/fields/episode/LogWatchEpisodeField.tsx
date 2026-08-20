'use client'

import { FieldGroup, FieldLegend, FieldSet } from '@/components/ui/field'

import type { LogWatchFormApi } from '../../../hooks/use-log-watch-form'

import { syncQuickLogEpisode } from '../../../services/episode-field'
import { LogWatchRewatchField } from '../LogWatchRewatchField'
import { EpisodeNumberField } from './EpisodeNumberField'
import { SeasonField } from './SeasonField'

type LogWatchEpisodeFieldProps = {
  disabled?: boolean
  form: LogWatchFormApi
  seasonCount?: null | number
  tmdbId?: null | number
}

export function LogWatchEpisodeField({
  disabled = false,
  form,
  seasonCount,
  tmdbId,
}: LogWatchEpisodeFieldProps) {
  const hasTmdbId = tmdbId != null && tmdbId > 0

  return (
    <FieldSet>
      <FieldLegend>Episode</FieldLegend>
      <FieldGroup>
        <div className="grid grid-cols-2 gap-2">
          <form.Subscribe selector={(state) => state.values.episode?.season ?? 1}>
            {(season) => (
              <>
                <SeasonField
                  disabled={disabled}
                  form={form}
                  hasTmdbId={hasTmdbId}
                  season={season}
                  seasonCount={seasonCount}
                />

                <EpisodeNumberField
                  disabled={disabled}
                  form={form}
                  hasTmdbId={hasTmdbId}
                  season={season}
                  tmdbId={tmdbId}
                />
              </>
            )}
          </form.Subscribe>
        </div>

        <LogWatchRewatchField
          disabled={disabled}
          form={form}
          onCheckedChange={() => {
            syncQuickLogEpisode(form)
          }}
        />
      </FieldGroup>
    </FieldSet>
  )
}
