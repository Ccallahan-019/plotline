import Link from 'next/link'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function SignUpLink() {
  return (
    <Link className={cn(buttonVariants({ size: 'sm' }))} href="/sign-up">
      Get started
    </Link>
  )
}
