import { STREAMING_PLATFORM_REGISTRY } from '@plotline/shared/constants'
import { useMemo } from 'react'

import { StreamingPlatformIcon } from '@/components/platform/StreamingPlatformIcon'
import { Skeleton } from '@/components/ui/skeleton'
import { ToggleGroupField } from '@/features/forms/components/ToggleGroupField'
import { cn } from '@/lib/utils'

import { useStreamingPlatformLogos } from '../../../hooks/use-streaming-platform-logos'

type LogWatchPlatformFieldContentProps = {
  disabled?: boolean
  layout?: 'compact' | 'expanded'
}

export function LogWatchPlatformFieldContent({
  disabled = false,
  layout = 'compact',
}: LogWatchPlatformFieldContentProps) {
  const { getPlatformLogoPath, isPending } = useStreamingPlatformLogos()

  const isCompact = layout === 'compact'

  const items = useMemo(() => {
    return STREAMING_PLATFORM_REGISTRY.map((entry) => ({
      label: entry.label,
      value: entry.value,
    }))
  }, [])

  if (isPending) {
    return (
      <div className="flex w-full flex-wrap gap-2">
        {STREAMING_PLATFORM_REGISTRY.map((entry) => (
          <Skeleton className={isCompact ? 'size-8' : 'h-9 w-24'} key={entry.value} />
        ))}
      </div>
    )
  }

  return (
    <ToggleGroupField
      allowDeselect
      disabled={disabled}
      itemClassName={cn(
        'data-[state=on]:ring-1 data-[state=on]:ring-ring',
        isCompact ? 'size-8 p-0' : 'h-auto px-2 py-1.5',
      )}
      items={items}
      renderItem={(item) => (
        <StreamingPlatformIcon
          logoPath={getPlatformLogoPath(item.value)}
          platform={item.value}
          showLabel={!isCompact}
          size={isCompact ? 'sm' : 'md'}
        />
      )}
    />
  )
}
