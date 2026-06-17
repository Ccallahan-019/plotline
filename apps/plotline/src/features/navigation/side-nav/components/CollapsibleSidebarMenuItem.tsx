"use client";

import { ChevronDown } from "lucide-react";
import { Easing, motion, useReducedMotion } from "motion/react";
import { useState } from "react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { ShowIf } from "@/components/utils/ShowIf";

import { SidebarMenuSubLink } from "../components/SidebarMenuSubLink";

export type CollapsibleSidebarMenuItemProps = {
  icon?: React.ReactNode;
  items: { href: string; icon?: React.ReactNode; label: string }[];
  label: string;
};

const listVariants = {
  closed: {
    transition: {
      staggerChildren: 0.04,
      staggerDirection: -1,
    },
  },
  open: {
    transition: {
      delayChildren: 0.06,
      staggerChildren: 0.04,
    },
  },
};

const itemVariants = {
  closed: {
    opacity: 0,
    transition: { duration: 0.05, ease: "easeIn" as Easing },
    y: -6,
  },
  open: {
    opacity: 1,
    transition: { duration: 0.15, ease: "easeOut" as Easing },
    y: 0,
  },
};

export function CollapsibleSidebarMenuItem({
  icon,
  items,
  label,
}: CollapsibleSidebarMenuItemProps) {
  const [open, setOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  return (
    <Collapsible onOpenChange={setOpen} open={open}>
      <SidebarMenuItem>
        <SidebarMenuButton
          render={
            <CollapsibleTrigger>
              <div className="flex items-center gap-2">
                {icon && icon}
                <span>{label}</span>
              </div>
              <motion.div
                animate={{ rotate: open ? 180 : 0 }}
                className="ml-auto flex items-center"
                transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
              >
                <ChevronDown />
              </motion.div>
            </CollapsibleTrigger>
          }
        />
      </SidebarMenuItem>

      <CollapsibleContent keepMounted>
        <motion.div
          animate={open ? "open" : "closed"}
          initial={false}
          transition={{
            staggerChildren: 0.04,
          }}
          variants={listVariants}
        >
          <SidebarMenuSub>
            {items.map((item, index) => (
              <SidebarMenuSubItem key={`${item.label}-${item.href}-${index}`}>
                <motion.div
                  className="w-full flex items-center gap-2"
                  variants={itemVariants}
                >
                  <SidebarMenuSubLink href={item.href}>
                    <span>{item.label}</span>
                    <ShowIf condition={!!item.icon}>
                      <div className="ml-auto">{item.icon}</div>
                    </ShowIf>
                  </SidebarMenuSubLink>
                </motion.div>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </motion.div>
      </CollapsibleContent>
    </Collapsible>
  );
}
