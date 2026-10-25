import { ChallengeGoalType } from '@plotline/shared/constants'

import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { ToggleGroupFieldItem } from '@/features/forms/components/ToggleGroupField'

import { WatchlistFormApi } from '../hooks/use-watchlist-form'

type WatchlistChallengeGoalTypeFieldProps = {
  form: WatchlistFormApi
  isSubmitting: boolean
}

export function WatchlistChallengeGoalTypeField({
  form,
  isSubmitting,
}: WatchlistChallengeGoalTypeFieldProps) {
  const GOAL_TYPE_ITEMS: ToggleGroupFieldItem<ChallengeGoalType>[] = [
    { label: 'Count', value: 'count' },
    { label: 'List', value: 'list_size' },
    { label: 'Runtime', value: 'runtime_minutes' },
  ]

  return (
    <form.AppField name="goalType">
      {(field) => (
        <Field data-disabled={isSubmitting}>
          <FieldLabel>Goal Type</FieldLabel>

          <field.ToggleGroupField<ChallengeGoalType>
            disabled={isSubmitting}
            itemClassName="flex-1"
            items={GOAL_TYPE_ITEMS}
            spacing={0}
            variant="outline"
          />
          <form.Subscribe selector={(state) => state.values.goalType}>
            {(goalType) => {
              if (goalType !== 'list_size') return null

              return (
                <FieldDescription>
                  The goal for this challenge is the qualifying titles currently on the list.
                </FieldDescription>
              )
            }}
          </form.Subscribe>

          <field.FormFieldError />
        </Field>
      )}
    </form.AppField>
  )
}
