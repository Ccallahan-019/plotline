'use client'

import { startOfDay } from 'date-fns'
import { Calendar } from 'lucide-react'

import { DatePicker } from '@/components/ui/date-picker'
import { Field, FieldContent } from '@/components/ui/field'
import { FieldLabel } from '@/components/ui/field'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

import type { LogWatchFormApi } from '../../../hooks/use-log-watch-form'
import type { LogWatchWhenPreset } from '../../../services/log-watch-form-schema'

import { watchedAtForWhenPreset } from '../../../services/log-watch-form'

const WHEN_PRESET_TOGGLE_ITEMS = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
] as const satisfies ReadonlyArray<{
  label: string
  value: Exclude<LogWatchWhenPreset, 'custom'>
}>

type LogWatchWhenDialogFieldProps = {
  disabled?: boolean
  form: LogWatchFormApi
}

export function LogWatchWhenDialogField({ disabled = false, form }: LogWatchWhenDialogFieldProps) {
  return (
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
      {(whenPresetField) => (
        <form.AppField
          listeners={{
            onChange: (value) => {
              if (value.value == null) {
                return
              }

              form.setFieldValue('whenPreset', 'custom', {
                dontRunListeners: true,
              })
            },
          }}
          name="watchedAt"
        >
          {(watchedAtField) => {
            const isCustom = whenPresetField.state.value === 'custom'
            const isWatchedAtInvalid = watchedAtField.state.meta.errors.length > 0

            const handleDateChange = (date: Date | undefined) => {
              if (date == null) {
                return
              }

              watchedAtField.handleChange(date)
            }

            const handleOpenChange = (open: boolean) => {
              if (!open) {
                return
              }

              form.setFieldValue('whenPreset', 'custom', {
                dontRunListeners: true,
              })
            }

            return (
              <Field data-disabled={disabled}>
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="size-3 text-muted-foreground" />
                  <FieldLabel className="leading-none">When did you watch this?</FieldLabel>
                </div>
                <FieldContent>
                  <ToggleGroup
                    className="w-full"
                    disabled={disabled}
                    onBlur={() => {
                      whenPresetField.handleBlur()
                    }}
                    onValueChange={(values) => {
                      const nextValue = values[0]
                      if (nextValue !== 'today' && nextValue !== 'yesterday') {
                        return
                      }

                      whenPresetField.handleChange(nextValue)
                    }}
                    size="sm"
                    value={
                      isCustom || whenPresetField.state.value == null
                        ? []
                        : [whenPresetField.state.value]
                    }
                    variant="outline"
                  >
                    {WHEN_PRESET_TOGGLE_ITEMS.map((item) => (
                      <ToggleGroupItem aria-label={item.label} key={item.value} value={item.value}>
                        {item.label}
                      </ToggleGroupItem>
                    ))}

                    <DatePicker
                      aria-invalid={isWatchedAtInvalid}
                      className="min-w-0 flex-1 max-w-fit"
                      disabled={disabled}
                      id={watchedAtField.name}
                      maxDate={startOfDay(new Date())}
                      onChange={handleDateChange}
                      onOpenChange={handleOpenChange}
                      placeholder="Pick a date"
                      size="sm"
                      value={isCustom ? watchedAtField.state.value : undefined}
                    />
                  </ToggleGroup>
                </FieldContent>
                <whenPresetField.FormFieldError />
                <watchedAtField.FormFieldError />
              </Field>
            )
          }}
        </form.AppField>
      )}
    </form.AppField>
  )
}
