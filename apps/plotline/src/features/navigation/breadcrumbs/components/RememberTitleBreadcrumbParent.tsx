'use client'

import { useEffect } from 'react'

import { writeTitleBreadcrumbParent } from '../services/title-breadcrumb-parent'

type RememberTitleBreadcrumbParentProps = {
  href: string
  label: string
}

export function RememberTitleBreadcrumbParent({
  href,
  label,
}: RememberTitleBreadcrumbParentProps) {
  useEffect(() => {
    writeTitleBreadcrumbParent({ href, label })
  }, [href, label])

  return null
}
