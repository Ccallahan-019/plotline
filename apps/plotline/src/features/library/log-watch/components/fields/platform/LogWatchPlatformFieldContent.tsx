import { STREAMING_PLATFORM_REGISTRY } from '@plotline/shared/constants'
import { useMemo } from 'react'

import { StreamingPlatformIcon } from '@/components/platform/StreamingPlatformIcon'
import { Skeleton } from '@/components/ui/skeleton'
import { ToggleGroupField } from '@/features/forms/components/ToggleGroupField'

import { useStreamingPlatformLogos } from '../../../hooks/use-streaming-platform-logos'
import { LogWatchPlatformPopoverField } from './LogWatchPlatformPopoverField'

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

  if (isCompact) {
    return <LogWatchPlatformPopoverField disabled={disabled} placeholder="Select a platform..." />
  }

  return (
    <ToggleGroupField
      allowDeselect
      disabled={disabled}
      itemClassName="data-[state=on]:ring-1 data-[state=on]:ring-ring h-auto px-2 py-1.5"
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
