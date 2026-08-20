'use client'

import { startOfDay } from 'date-fns'

import { Field, FieldContent, FieldGroup, FieldLegend, FieldSet } from '@/components/ui/field'
import { ShowIf } from '@/components/utils/ShowIf'

import type { LogWatchFormApi } from '../../hooks/use-log-watch-form'
import type { LogWatchWhenPreset } from '../../services/log-watch-form-schema'

import { watchedAtForWhenPreset, whenPresetForWatchedAt } from '../../services/log-watch-form'

const WHEN_PRESET_ITEMS = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Pick date', value: 'custom' },
] as const satisfies ReadonlyArray<{ label: string; value: LogWatchWhenPreset }>

type LogWatchWhenFieldProps = {
  disabled?: boolean
  form: LogWatchFormApi
}

export function LogWatchWhenField({ disabled = false, form }: LogWatchWhenFieldProps) {
  return (
    <FieldSet>
      <FieldLegend>When did you watch this?</FieldLegend>

      <FieldGroup>
        <form.AppField
          listeners={{
            onChange: (value) => {
              if (value.value != null && value.value !== 'custom') {
                form.setFieldValue('watchedAt', watchedAtForWhenPreset(value.value))
              }
            },
          }}
          name="whenPreset"
        >
          {(field) => (
            <Field data-disabled={disabled}>
              <FieldContent className="gap-2">
                <field.ToggleGroupField
                  disabled={disabled}
                  items={WHEN_PRESET_ITEMS}
                  size="sm"
                  variant="outline"
                />
              </FieldContent>
              <field.FormFieldError />
            </Field>
          )}
        </form.AppField>

        <form.Subscribe selector={(state) => state.values.whenPreset === 'custom'}>
          {(isCustom) => (
            <ShowIf condition={isCustom}>
              <form.AppField
                listeners={{
                  onChange: (value) => {
                    if (value.value == null) {
                      return
                    }

                    form.setFieldValue('whenPreset', whenPresetForWatchedAt(value.value), {
                      dontRunListeners: true,
                    })
                  },
                }}
                name="watchedAt"
              >
                {(field) => (
                  <Field data-disabled={disabled}>
                    <field.DateField
                      disabled={disabled}
                      maxDate={startOfDay(new Date())}
                      placeholder="Pick a date"
                    />
                    <field.FormFieldError />
                  </Field>
                )}
              </form.AppField>
            </ShowIf>
          )}
        </form.Subscribe>
      </FieldGroup>
    </FieldSet>
  )
}
