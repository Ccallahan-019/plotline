"use client";

import { Separator } from "@/components/ui/separator";

import { useBrowseMode } from "../../providers/BrowseModeProvider";

export function FilterBarSeparator() {
  const { mode } = useBrowseMode();

  const showSeparator = mode === "discover";

  if (!showSeparator) return null;

  return <Separator />;
}
