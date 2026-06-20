import { motion, MotionProps } from 'motion/react'
import { ComponentProps } from 'react'

import { Badge } from '@/components/ui/badge'

type MotionBadgeProps = ComponentProps<typeof Badge> & MotionProps

export function MotionBadge({ ...props }: MotionBadgeProps) {
  return <MotionBadgeComponent {...props} />
}

const MotionBadgeComponent = motion(Badge)
