import Link from 'next/link'
import { ComponentProps } from 'react'

import { Button } from '../ui/button'

type ButtonLinkProps = {
  href: string
} & Omit<ComponentProps<typeof Button>, 'nativeButton' | 'render'>

export function ButtonLink({ href, size, variant, ...props }: ButtonLinkProps) {
  return (
    <Button
      nativeButton={false}
      render={<Link href={href} />}
      size={size}
      variant={variant}
      {...props}
    />
  )
}
