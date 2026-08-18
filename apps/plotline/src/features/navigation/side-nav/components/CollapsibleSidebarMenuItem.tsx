'use client'

import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import { ShowIf } from '@/components/utils/ShowIf'
import { cn } from '@/lib/utils'

import { SidebarMenuSubLink } from '../components/SidebarMenuSubLink'

export type CollapsibleSidebarMenuItemProps = {
  icon?: React.ReactNode
  items: { href: string; icon?: React.ReactNode; label: string }[]
  label: string
}

export function CollapsibleSidebarMenuItem({
  icon,
  items,
  label,
}: CollapsibleSidebarMenuItemProps) {
  const [open, setOpen] = useState(false)

  return (
    <Collapsible onOpenChange={setOpen} open={open} render={<SidebarMenuItem />}>
      <SidebarMenuButton render={<CollapsibleTrigger />} tooltip={label}>
        {icon}
        <span className="truncate group-data-[collapsible=icon]:hidden">{label}</span>
        <ChevronDown
          className={cn(
            'ml-auto size-4 shrink-0 transition-transform duration-200',
            'group-data-[collapsible=icon]:hidden',
            open && 'rotate-180',
          )}
        />
      </SidebarMenuButton>

      <CollapsibleContent keepMounted>
        <SidebarMenuSub>
          {items.map((item, index) => (
            <SidebarMenuSubItem key={`${item.label}-${item.href}-${index}`}>
              <div className="w-full flex items-center gap-2">
                <SidebarMenuSubLink href={item.href}>
                  <span>{item.label}</span>
                  <ShowIf condition={!!item.icon}>
                    <div className="ml-auto">{item.icon}</div>
                  </ShowIf>
                </SidebarMenuSubLink>
              </div>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  )
}
