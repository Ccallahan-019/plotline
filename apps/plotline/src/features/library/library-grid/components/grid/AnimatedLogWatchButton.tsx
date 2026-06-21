'use client'

import { Media } from '@plotline/payload-types'
import { Check } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'

import { MotionButton } from '@/components/animation/MotionButton'
import { Spinner } from '@/components/ui/spinner'
import { useLogWatch } from '@/features/library/library-grid/hooks/use-log-watch'
import { getMediaId } from '@/features/media-grid/grid/services/media-display-helpers'
import { cn } from '@/lib/utils'

type AnimatedLogWatchButtonProps = {
  animationKey?: string
  media: Media
  triggerAnimation?: boolean
}

export function AnimatedLogWatchButton({
  animationKey,
  media,
  triggerAnimation = false,
}: AnimatedLogWatchButtonProps) {
  const logWatchMutation = useLogWatch()

  const handleLogWatch = () => {
    logWatchMutation.mutate({
      eventType: 'completed',
      libraryItemStatus: 'completed',
      mediaId: getMediaId(media),
    })
  }

  const key = animationKey
    ? triggerAnimation
      ? `${animationKey}-Log Watch-animated`
      : `${animationKey}-Log Watch`
    : 'Log Watch'

  const isPending = logWatchMutation.isPending

  const buttonAddon = isPending ? <Spinner /> : <Check />

  return (
    <MotionButton
      className={cn(triggerAnimation ? 'gap-1.5 px-3' : 'gap-0 px-2')}
      disabled={isPending}
      onClick={handleLogWatch}
      transition={{ duration: 0.2 }}
    >
      {buttonAddon}
      <AnimatePresence initial={false} mode="sync">
        {triggerAnimation && (
          <motion.div
            animate={{ width: 'auto' }}
            exit={{ width: 0 }}
            initial={{ width: 0 }}
            key={key}
            style={{ overflow: 'hidden' }}
            transition={{ duration: 0.2 }}
          >
            Log Watch
          </motion.div>
        )}
      </AnimatePresence>
    </MotionButton>
  )
}
