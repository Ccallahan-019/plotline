'use client'

import type { LogWatchFormApi } from '../../../hooks/use-log-watch-form'

import { LogWatchWhenDialogField } from './LogWatchWhenDialogField'
import { LogWatchWhenPopoverField } from './LogWatchWhenPopoverField'

type LogWatchWhenFieldProps = {
  disabled?: boolean
  form: LogWatchFormApi
  mode: 'dialog' | 'popover'
}

export function LogWatchWhenField({ disabled = false, form, mode }: LogWatchWhenFieldProps) {
  if (mode === 'popover') {
    return <LogWatchWhenPopoverField disabled={disabled} form={form} />
  }

  return <LogWatchWhenDialogField disabled={disabled} form={form} />
}
