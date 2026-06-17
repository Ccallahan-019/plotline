"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SidebarMenuSubButton } from "@/components/ui/sidebar";

import { isLinkActive } from "../services/is-link-active";

export function SidebarMenuSubLink({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string;
}) {
  const pathname = usePathname();
  const isActive = isLinkActive(href, pathname);

  return (
    <SidebarMenuSubButton
      isActive={isActive}
      render={
        <Link className="w-full" href={href}>
          {children}
        </Link>
      }
    />
  );
}
