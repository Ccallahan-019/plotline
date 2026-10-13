import { Check } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { PopoverTrigger } from '@/components/ui/popover'

type LogWatchPopoverTriggerProps = {
  disabled: boolean
  triggerLabel: string
}

export function LogWatchPopoverTrigger({ disabled, triggerLabel }: LogWatchPopoverTriggerProps) {
  return (
    <PopoverTrigger aria-label={triggerLabel} disabled={disabled} render={<Button />}>
      <Check />
      Log Watch
    </PopoverTrigger>
  )
}
