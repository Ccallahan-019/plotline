'use client'

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from '@/components/ui/field'

import type { WatchlistFormApi } from '../hooks/use-watchlist-form'

import { WatchlistChallengeGoalTypeField } from './WatchlistChallengeGoalTypeField'
import { WatchlistChallengePriorCompletionRuleField } from './WatchlistChallengePriorCompletionRuleField'
import { WatchlistChallengeTvCountRuleField } from './WatchlistChallengeTvCountRuleField'

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

      <WatchlistChallengeGoalTypeField form={form} isSubmitting={isSubmitting} />

      <form.Subscribe selector={(state) => state.values.goalType}>
        {(goalType) => {
          if (goalType === 'list_size') return null

          return (
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
          )
        }}
      </form.Subscribe>

      <WatchlistChallengeTvCountRuleField form={form} isSubmitting={isSubmitting} />

      <WatchlistChallengePriorCompletionRuleField form={form} isSubmitting={isSubmitting} />

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
