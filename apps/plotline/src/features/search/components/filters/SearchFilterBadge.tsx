"use client";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useSearchFilters } from "../../providers/SearchFiltersProvider";
import { FilterBadge } from "../../types";

type SearchFilterBadgeProps = {
  badge: FilterBadge;
};
export function SearchFilterBadge({ badge }: SearchFilterBadgeProps) {
  const { removeFilter } = useSearchFilters();

  const handleClear = () => {
    removeFilter(badge.key);
  };

  return (
    <Button
      className="rounded-full text-xs"
      onClick={handleClear}
      variant="secondary"
    >
      <span className="text-muted-foreground">{badge.prefix}:</span>{" "}
      {badge.label}
      <X className="size-3 text-muted-foreground" data-icon="inline-end" />
    </Button>
  );
}
