import Image from 'next/image'
import Link from 'next/link'
import { Fragment } from 'react/jsx-runtime'

import { cn } from '@/lib/utils'

type OverviewLinkProps = {
  className?: string
  /** Renders the logo only, for use inside another link (e.g. breadcrumb). */
  logoOnly?: boolean
}

export function OverviewLink({ className, logoOnly = false }: OverviewLinkProps) {
  const logo = (
    <Fragment>
      <Image
        alt=""
        aria-hidden
        className={cn('h-[20px] w-auto', className)}
        height={20}
        src="/icon.png"
        width={20}
      />
      <span className="sr-only">Overview</span>
    </Fragment>
  )

  if (logoOnly) {
    return logo
  }

  return (
    <Link className="inline-flex transition-opacity hover:opacity-80" href="/dashboard">
      {logo}
    </Link>
  )
}
