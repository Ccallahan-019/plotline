import { Check } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { PopoverTrigger } from '@/components/ui/popover'

import { useLogWatchPopover } from '../../providers/LogWatchPopoverProvider'
import { logWatchTriggerLabel } from '../../services/log-watch-trigger'

/** Button size when the caller does not set one. */
const DEFAULT_TRIGGER_SIZE = 'default' as const

type LogWatchPopoverTriggerProps = {
  /** Names the title for assistive tech. Differs from the visible label on library cards. */
  accessibleName: string
  disabled: boolean
}

export function LogWatchPopoverTrigger({ accessibleName, disabled }: LogWatchPopoverTriggerProps) {
  const { triggerLabel, triggerSize } = useLogWatchPopover()
  const label = logWatchTriggerLabel(triggerLabel)
  const size = triggerSize ?? DEFAULT_TRIGGER_SIZE

  return (
    <PopoverTrigger aria-label={accessibleName} disabled={disabled} render={<Button size={size} />}>
      <Check />
      {label}
    </PopoverTrigger>
  )
}
