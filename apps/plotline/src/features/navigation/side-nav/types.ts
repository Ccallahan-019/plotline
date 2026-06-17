import { CollapsibleSidebarMenuItemProps } from "./components/CollapsibleSidebarMenuItem";

export type SidebarMenuItem =
  | (CollapsibleSidebarMenuItem & SidebarMenuItemBase)
  | (SidebarMenuItemBase & StandardSidebarMenuItem);

type CollapsibleSidebarMenuItem = {
  type: "collapsible";
} & CollapsibleSidebarMenuItemProps;

type SidebarMenuItemBase = {
  id: string;
};

type StandardSidebarMenuItem = {
  href: string;
  icon?: React.ReactNode;
  label: string;
  type: "standard";
};
