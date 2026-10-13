import Link from 'next/link'

import { BreadcrumbLink, BreadcrumbPage } from '@/components/ui/breadcrumb'
import { Skeleton } from '@/components/ui/skeleton'

import { BreadcrumbSegment } from '../types'
import { OverviewLink } from './OverviewLink'

type BreadcrumbItemContentProps = {
  breadcrumb: BreadcrumbSegment
  isLast: boolean
}

export function BreadcrumbItemContent({ breadcrumb, isLast }: BreadcrumbItemContentProps) {
  const { href, kind, label } = breadcrumb

  if (kind === 'pending') {
    return (
      <>
        <span aria-current={isLast ? 'page' : undefined} className="sr-only">
          Loading title
        </span>
        <Skeleton aria-hidden className="h-4 w-32" />
      </>
    )
  }

  if (kind === 'overview') {
    if (isLast) {
      return (
        <BreadcrumbPage>
          <OverviewLink logoOnly />
        </BreadcrumbPage>
      )
    }

    return (
      <BreadcrumbLink render={<Link className="inline-flex" href="/dashboard" />}>
        <div className="pr-0.5">
          <OverviewLink logoOnly />
        </div>
      </BreadcrumbLink>
    )
  }

  if (isLast) {
    return <BreadcrumbPage className="truncate">{label}</BreadcrumbPage>
  }

  if (href) {
    return (
      <BreadcrumbLink className="truncate" render={<Link href={href} />}>
        {label}
      </BreadcrumbLink>
    )
  }

  return <span className="truncate">{label}</span>
}
