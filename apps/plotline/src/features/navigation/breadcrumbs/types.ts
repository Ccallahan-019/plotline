export type BreadcrumbRoute = {
  groupLabel?: string
  label: string
  pending?: boolean
  section?: string
  sectionHref?: string
}

export type BreadcrumbSegment = {
  href?: string
  kind?: 'overview' | 'pending'
  label: string
}
