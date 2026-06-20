import Link from 'next/link'

import { BreadcrumbLink, BreadcrumbPage } from '@/components/ui/breadcrumb'

import { BreadcrumbSegment } from '../types'
import { OverviewLink } from './OverviewLink'

type BreadcrumbItemContentProps = {
  breadcrumb: BreadcrumbSegment
  isLast: boolean
}

export function BreadcrumbItemContent({ breadcrumb, isLast }: BreadcrumbItemContentProps) {
  const { href, kind, label } = breadcrumb

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
        <div className="pr-[2px]">
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
