import type { PriorCompletionRule } from '@plotline/shared/constants'

import type { SelectFieldItem } from '@/features/forms/components/SelectField'

import { Field, FieldContent, FieldLabel } from '@/components/ui/field'

import type { WatchlistFormApi } from '../hooks/use-watchlist-form'

const PRIOR_COMPLETION_ITEMS: SelectFieldItem<PriorCompletionRule>[] = [
  { label: 'Exclude Already-Completed Titles', value: 'exclude_if_already_completed' },
  { label: 'Count If Completed After Joining', value: 'count_if_completed_after_join' },
  { label: 'Count All On Joining', value: 'count_all_on_join' },
]

type WatchlistChallengePriorCompletionRuleFieldProps = {
  form: WatchlistFormApi
  isSubmitting: boolean
}

export function WatchlistChallengePriorCompletionRuleField({
  form,
  isSubmitting,
}: WatchlistChallengePriorCompletionRuleFieldProps) {
  return (
    <form.AppField name="priorCompletionRule">
      {(field) => (
        <Field data-disabled={isSubmitting}>
          <FieldLabel htmlFor={field.name}>Prior Completions</FieldLabel>
          <FieldContent>
            <field.SelectField<PriorCompletionRule>
              disabled={isSubmitting}
              items={PRIOR_COMPLETION_ITEMS}
            />
          </FieldContent>
          <field.FormFieldError />
        </Field>
      )}
    </form.AppField>
  )
}
