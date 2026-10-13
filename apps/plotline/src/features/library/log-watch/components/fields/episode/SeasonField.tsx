import { Field, FieldContent, FieldLabel } from '@/components/ui/field'

import { LogWatchFormApi } from '../../../hooks/use-log-watch-form'
import {
  getSeasonSelectOptions,
  syncQuickLogEpisodeAfterSeasonChange,
} from '../../../services/episode-field'

export function SeasonField({
  disabled,
  form,
  hasTmdbId,
  season,
  seasonCount,
}: {
  disabled: boolean
  form: LogWatchFormApi
  hasTmdbId: boolean
  season: number
  seasonCount?: null | number
}) {
  return (
    <form.AppField
      listeners={{
        onChange: () => {
          syncQuickLogEpisodeAfterSeasonChange(form)
        },
      }}
      name="episode.season"
    >
      {(field) => (
        <Field className="items-center!" data-disabled={disabled} orientation="horizontal">
          <FieldLabel className="max-w-20">Season</FieldLabel>
          <FieldContent>
            {hasTmdbId ? (
              <field.SelectField
                aria-label="Season"
                disabled={disabled}
                items={getSeasonSelectOptions(seasonCount, season).map((option) => ({
                  label: `Season ${option}`,
                  value: option,
                }))}
              />
            ) : (
              <field.NumberField aria-label="Season" disabled={disabled} min={0} />
            )}
          </FieldContent>
          <field.FormFieldError />
        </Field>
      )}
    </form.AppField>
  )
}
