import {
  SidebarMenu as BaseSidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import {
  CollapsibleSidebarMenuItem,
  CollapsibleSidebarMenuItemProps,
} from "./CollapsibleSidebarMenuItem";
import { SidebarMenuLink } from "./SidebarMenuLink";

export type SidebarMenuItem =
  | (CollapsibleSidebarMenuItem & SidebarMenuItemBase)
  | (SidebarMenuItemBase & StandardSidebarMenuItem);

type CollapsibleSidebarMenuItem = {
  type: "collapsible";
} & CollapsibleSidebarMenuItemProps;

type SidebarMenuItemBase = {
  id: string;
};

type SidebarMenuProps = {
  items: SidebarMenuItem[];
};

type StandardSidebarMenuItem = {
  href: string;
  icon?: React.ReactNode;
  label: string;
  type: "standard";
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
    <SidebarMenuItem key={item.id}>
      <SidebarMenuLink href={item.href} icon={item.icon} label={item.label} />
    </SidebarMenuItem>
  );
}
