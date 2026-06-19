"use client";

import { SlidersHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShowIf } from "@/components/utils/ShowIf";
import { useOpenState } from "@/providers/OpenStateProvider";

import { useSearchFilters } from "../../providers/SearchFiltersProvider";

export function ShowFiltersButton() {
  const { setIsOpen } = useOpenState();
  const { appliedFilters } = useSearchFilters();

  const filtersCount = Object.keys(appliedFilters).length;
  const hasFilters = filtersCount > 0;

  const handleClick = () => {
    setIsOpen(true);
  };

  return (
    <Button
      className="ml-auto shrink-0 gap-2"
      onClick={handleClick}
      type="button"
      variant="outline"
    >
      <SlidersHorizontal data-icon="inline-start" />
      Show Filters
      <ShowIf condition={hasFilters}>
        <Badge>{filtersCount}</Badge>
      </ShowIf>
    </Button>
  );
}
