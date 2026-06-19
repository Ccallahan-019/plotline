"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShowIf } from "@/components/utils/ShowIf";
import { cn } from "@/lib/utils";

import { useFilterErrors } from "../../providers/FilterErrorsProvider";
import { useSearchFilters } from "../../providers/SearchFiltersProvider";
import {
  countActiveDiscoverFilters,
  hasActiveDiscoverFilters,
} from "../../services/normalize-search-filters";

type ClearAllFiltersButtonProps = {
  badgeVariant?: "ghost" | "outline";
  className?: string;
  showBadge?: boolean;
  size?: "default" | "sm" | "xs";
};

export function ClearAllFiltersButton({
  badgeVariant = "ghost",
  className,
  showBadge = true,
  size = "sm",
}: ClearAllFiltersButtonProps) {
  const { appliedFilters, clearAll } = useSearchFilters();
  const { setRatingError, setRuntimeError } = useFilterErrors();

  const hasFilters = hasActiveDiscoverFilters(appliedFilters);
  const filterCount = countActiveDiscoverFilters(appliedFilters);

  const handleClearAll = () => {
    clearAll();
    setRatingError(null);
    setRuntimeError(null);
  };

  if (!hasFilters) return null;

  return (
    <Button
      className={cn("flex items-center gap-2", className)}
      onClick={handleClearAll}
      size={size}
      variant={badgeVariant}
    >
      Clear All
      <ShowIf condition={showBadge}>
        <Badge variant="outline">{filterCount}</Badge>
      </ShowIf>
    </Button>
  );
}
