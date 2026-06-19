import { SlidersHorizontal } from "lucide-react";

import { FieldGroup } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import {
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { ApplyFilterButton } from "./ApplyFilterButton";
import { ClearAllFiltersButton } from "./ClearAllFiltersButton";
import { FiltersSheet } from "./FiltersSheet";
import { GenreFilter } from "./GenreFilter";
import { RatingFilter } from "./RatingFilter";
import { ReleaseYearFilter } from "./ReleaseYearFilter";
import { RuntimeFilter } from "./RuntimeFilter";
import { StreamingServiceFilter } from "./StreamingServiceFilter";

export function SearchFilters() {
  return (
    <FiltersSheet>
      <SheetContent side="right">
        <div className="inset-x-0">
          <SheetHeader>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="size-4 text-primary" />
              <SheetTitle>Filters</SheetTitle>
            </div>
          </SheetHeader>
          <Separator />
        </div>

        <FieldGroup className="px-4 overflow-y-auto scrollbar-thin">
          <GenreFilter />
          <Separator />
          <ReleaseYearFilter />
          <Separator />
          <RatingFilter />
          <Separator />
          <StreamingServiceFilter />
          <Separator />
          <RuntimeFilter />
        </FieldGroup>

        <SheetFooter>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <ClearAllFiltersButton />
            </div>
            <ApplyFilterButton />
          </div>
        </SheetFooter>
      </SheetContent>
    </FiltersSheet>
  );
}
