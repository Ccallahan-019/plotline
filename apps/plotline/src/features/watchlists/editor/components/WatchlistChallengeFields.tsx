'use client'

import type {
  ChallengeGoalType,
  PriorCompletionRule,
  TvCountRule,
} from '@plotline/shared/constants'

import type { SelectFieldItem } from '@/features/forms/components/SelectField'
import type { ToggleGroupFieldItem } from '@/features/forms/components/ToggleGroupField'

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from '@/components/ui/field'

import type { WatchlistFormApi } from '../hooks/use-watchlist-form'

const GOAL_TYPE_ITEMS: ToggleGroupFieldItem<ChallengeGoalType>[] = [
  { label: 'Count', value: 'count' },
  { label: 'Runtime', value: 'runtime_minutes' },
]

const TV_COUNT_ITEMS: SelectFieldItem<TvCountRule>[] = [
  { label: 'Movies Only', value: 'movies_only' },
  { label: 'As a Series', value: 'tv_as_series' },
  { label: 'By Episode', value: 'tv_by_episode' },
  { label: 'By Season', value: 'tv_by_season' },
]

const PRIOR_COMPLETION_ITEMS: SelectFieldItem<PriorCompletionRule>[] = [
  { label: 'Exclude Already-Completed Titles', value: 'exclude_if_already_completed' },
  { label: 'Count If Completed After Joining', value: 'count_if_completed_after_join' },
  { label: 'Count All On Joining', value: 'count_all_on_join' },
]

type WatchlistChallengeFieldsProps = {
  form: WatchlistFormApi
  isSubmitting: boolean
}

export function WatchlistChallengeFields({ form, isSubmitting }: WatchlistChallengeFieldsProps) {
  return (
    <FieldGroup>
      <div className="grid gap-4 sm:grid-cols-2">
        <form.AppField name="startDate">
          {(field) => (
            <Field data-disabled={isSubmitting}>
              <FieldLabel htmlFor={field.name}>Start Date</FieldLabel>
              <FieldContent>
                <field.DateField
                  allowEmpty
                  disabled={isSubmitting}
                  placeholder="Optional start date..."
                />
              </FieldContent>
              <FieldDescription>Pacing uses the created date when this is empty.</FieldDescription>
              <field.FormFieldError />
            </Field>
          )}
        </form.AppField>

        <form.AppField name="dueDate">
          {(field) => (
            <Field data-disabled={isSubmitting}>
              <FieldLabel htmlFor={field.name}>Due Date</FieldLabel>
              <FieldContent>
                <field.DateField allowEmpty disabled={isSubmitting} placeholder="Due date..." />
              </FieldContent>
              <field.FormFieldError />
            </Field>
          )}
        </form.AppField>
      </div>

      <form.AppField name="goalType">
        {(field) => (
          <Field data-disabled={isSubmitting}>
            <FieldLabel>Goal Type</FieldLabel>
            <FieldContent>
              <field.ToggleGroupField<ChallengeGoalType>
                disabled={isSubmitting}
                itemClassName="flex-1"
                items={GOAL_TYPE_ITEMS}
                spacing={0}
                variant="outline"
              />
            </FieldContent>
            <field.FormFieldError />
          </Field>
        )}
      </form.AppField>

      <form.Subscribe selector={(state) => state.values.goalType}>
        {(goalType) => (
          <div className="grid gap-4 sm:grid-cols-2">
            <form.AppField name="goalCount">
              {(field) => {
                const countDisabled = isSubmitting || goalType !== 'count'

                return (
                  <Field data-disabled={countDisabled}>
                    <FieldLabel htmlFor={field.name}>Titles</FieldLabel>
                    <FieldContent>
                      <field.NumberField
                        disabled={countDisabled}
                        min={1}
                        placeholder="52"
                        step={1}
                      />
                    </FieldContent>
                    <field.FormFieldError />
                  </Field>
                )
              }}
            </form.AppField>

            <form.AppField name="goalHours">
              {(field) => {
                const runtimeDisabled = isSubmitting || goalType !== 'runtime_minutes'

                return (
                  <Field data-disabled={runtimeDisabled}>
                    <FieldLabel htmlFor={field.name}>Hours</FieldLabel>
                    <FieldContent>
                      <field.NumberField
                        disabled={runtimeDisabled}
                        min={0}
                        placeholder="100"
                        step="any"
                      />
                    </FieldContent>
                    <field.FormFieldError />
                  </Field>
                )
              }}
            </form.AppField>
          </div>
        )}
      </form.Subscribe>

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

      <form.AppField name="includeRewatches">
        {(field) => (
          <FieldLabel htmlFor={field.name}>
            <Field data-disabled={isSubmitting} orientation="horizontal">
              <FieldContent>
                <FieldTitle>Include Rewatches</FieldTitle>
                <FieldDescription>
                  Count a later rewatch of a title you finished before joining.
                </FieldDescription>
              </FieldContent>
              <field.SwitchField disabled={isSubmitting} />
            </Field>
          </FieldLabel>
        )}
      </form.AppField>
    </FieldGroup>
  )
}
