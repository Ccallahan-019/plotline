"use client";

import { Button } from "@/components/ui/button";

import { useApplySearchFilters } from "../../hooks/use-apply-search-filters";

export function ApplyFilterButton() {
  const { handleApply } = useApplySearchFilters();

  return (
    <Button onClick={handleApply} type="button">
      Apply Filters
    </Button>
  );
}
