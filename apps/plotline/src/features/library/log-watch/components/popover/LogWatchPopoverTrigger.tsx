import { Check } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { PopoverTrigger } from '@/components/ui/popover'

/** Visible label when the caller does not override the log button. */
const DEFAULT_TRIGGER_LABEL = 'Log Watch'

type LogWatchPopoverTriggerProps = {
  /** Names the title for assistive tech. Differs from the visible label on library cards. */
  accessibleName: string
  disabled: boolean
  triggerLabel?: string
}

export function LogWatchPopoverTrigger({
  accessibleName,
  disabled,
  triggerLabel = DEFAULT_TRIGGER_LABEL,
}: LogWatchPopoverTriggerProps) {
  return (
    <PopoverTrigger aria-label={accessibleName} disabled={disabled} render={<Button />}>
      <Check />
      {triggerLabel}
    </PopoverTrigger>
  )
}
