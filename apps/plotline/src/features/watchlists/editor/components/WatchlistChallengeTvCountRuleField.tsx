import type { TvCountRule } from '@plotline/shared/constants'

import type { SelectFieldItem } from '@/features/forms/components/SelectField'

import { Field, FieldContent, FieldLabel } from '@/components/ui/field'

import type { WatchlistFormApi } from '../hooks/use-watchlist-form'

const TV_COUNT_ITEMS: SelectFieldItem<TvCountRule>[] = [
  { label: 'Movies Only', value: 'movies_only' },
  { label: 'As a Series', value: 'tv_as_series' },
  { label: 'By Episode', value: 'tv_by_episode' },
  { label: 'By Season', value: 'tv_by_season' },
]

type WatchlistChallengeTvCountRuleFieldProps = {
  form: WatchlistFormApi
  isSubmitting: boolean
}

export function WatchlistChallengeTvCountRuleField({
  form,
  isSubmitting,
}: WatchlistChallengeTvCountRuleFieldProps) {
  return (
    <form.AppField name="tvCountRule">
      {(field) => (
        <Field data-disabled={isSubmitting}>
          <FieldLabel htmlFor={field.name}>TV Counting</FieldLabel>
          <FieldContent>
            <field.SelectField<TvCountRule> disabled={isSubmitting} items={TV_COUNT_ITEMS} />
          </FieldContent>
          <field.FormFieldError />
        </Field>
      )}
    </form.AppField>
  )
}
