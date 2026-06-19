"use client";

import { FieldDescription, FieldLabel } from "@/components/ui/field";
import { Field } from "@/components/ui/field";
import { Slider } from "@/components/ui/slider";

import { useSearchFilters } from "../../providers/SearchFiltersProvider";
import { getCurrentYear, getDefaultYearRange } from "../../types";

export function ReleaseYearFilter() {
  const { draftFilters, setDraftFilters } = useSearchFilters();
  const { max: defaultYearMax, min: defaultYearMin } = getDefaultYearRange();

  const yearRange = [
    draftFilters.yearMin ?? defaultYearMin,
    draftFilters.yearMax ?? defaultYearMax,
  ];

  const handleChange = (value: number | readonly number[]) => {
    const range = Array.isArray(value) ? value : [value, value];
    const [yearMin, yearMax] = range;

    setDraftFilters({
      ...draftFilters,
      yearMax,
      yearMin,
    });
  };

  return (
    <Field>
      <FieldLabel className="font-semibold mb-2">Release Year</FieldLabel>
      <Slider
        className="mb-1"
        max={getCurrentYear()}
        min={defaultYearMin}
        onValueChange={handleChange}
        value={yearRange}
      />
      <div className="flex items-center gap-2 justify-between">
        <FieldDescription className="text-xs">{yearRange[0]}</FieldDescription>
        <FieldDescription className="text-xs">{yearRange[1]}</FieldDescription>
      </div>
    </Field>
  );
}
