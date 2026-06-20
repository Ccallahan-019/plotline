'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { SidebarMenuButton } from '@/components/ui/sidebar'

import { isLinkActive } from '../services/is-link-active'

type SidebarMenuLinkProps = {
  href: string
  icon: React.ReactNode
  label: string
}

export function SidebarMenuLink({ href, icon, label }: SidebarMenuLinkProps) {
  const pathname = usePathname()
  const isActive = isLinkActive(href, pathname)

  return (
    <SidebarMenuButton
      isActive={isActive}
      render={
        <Link href={href}>
          {icon && icon}
          <span className="truncate group-data-[collapsible=icon]:hidden">{label}</span>
        </Link>
      }
    />
  )
}
