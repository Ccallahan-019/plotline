import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ShowIf } from '@/components/utils/ShowIf'

const VISIBLE_NAME_COUNT = 4

type MediaKeyCreditNamesProps = {
  label: string
  names: string[]
}

export function MediaKeyCreditNames({ label, names }: MediaKeyCreditNamesProps) {
  const visibleNames = names.slice(0, VISIBLE_NAME_COUNT)
  const hiddenCount = names.length - visibleNames.length

  return (
    <dd className="text-sm inline-flex flex-wrap items-center gap-1">
      {visibleNames.join(', ')}
      <ShowIf condition={hiddenCount > 0}>
        <Tooltip>
          <TooltipTrigger delay={200}>
            <Badge aria-label={`Show all ${label.toLowerCase()}`}>+{hiddenCount}</Badge>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs text-left whitespace-normal">
            {names.join(', ')}
          </TooltipContent>
        </Tooltip>
      </ShowIf>
    </dd>
  )
}
