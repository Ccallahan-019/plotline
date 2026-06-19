"use client";

import { PropsWithChildren } from "react";

import { Sheet } from "@/components/ui/sheet";
import { useOpenState } from "@/providers/OpenStateProvider";

export function FiltersSheet({ children }: PropsWithChildren) {
  const { isOpen, setIsOpen } = useOpenState();

  return (
    <Sheet onOpenChange={setIsOpen} open={isOpen}>
      {children}
    </Sheet>
  );
}
