'use client'

import { motion, MotionProps } from 'motion/react'
import { ComponentProps } from 'react'

import { Button } from '../ui/button'

type MotionButtonProps = ComponentProps<typeof Button> & MotionProps

export function MotionButton({ ...props }: MotionButtonProps) {
  return <MotionButtonComponent {...props} />
}

const MotionButtonComponent = motion.create(Button)
