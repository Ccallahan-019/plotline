import {
  SidebarMenu as BaseSidebarMenu,
  SidebarMenuItem as BaseSidebarMenuItem,
} from "@/components/ui/sidebar";

import type { SidebarMenuItem } from "../types";

import { CollapsibleSidebarMenuItem } from "./CollapsibleSidebarMenuItem";
import { SidebarMenuLink } from "./SidebarMenuLink";

type SidebarMenuProps = {
  items: SidebarMenuItem[];
};

export function SidebarMenu({ items }: SidebarMenuProps) {
  return (
    <BaseSidebarMenu>
      {items.map((item) => renderMenuItem(item))}
    </BaseSidebarMenu>
  );
}

function renderMenuItem(item: SidebarMenuItem) {
  if (item.type === "collapsible") {
    return <CollapsibleSidebarMenuItem key={item.id} {...item} />;
  }
  return (
    <BaseSidebarMenuItem key={item.id}>
      <SidebarMenuLink href={item.href} icon={item.icon} label={item.label} />
    </BaseSidebarMenuItem>
  );
}
