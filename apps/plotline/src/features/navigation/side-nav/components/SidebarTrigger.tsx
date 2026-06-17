"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";

export function SidebarTrigger() {
  const { open, toggleSidebar } = useSidebar();

  const Icon = open ? PanelLeftClose : PanelLeftOpen;

  return (
    <Button onClick={toggleSidebar} size="icon-sm" variant="secondary">
      <Icon />
    </Button>
  );
}
