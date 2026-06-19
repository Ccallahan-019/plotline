"use client";

import { FieldDescription, FieldLabel } from "@/components/ui/field";
import { Field } from "@/components/ui/field";
import { Slider } from "@/components/ui/slider";
import { ShowIf } from "@/components/utils/ShowIf";

import { useFilterErrors } from "../../providers/FilterErrorsProvider";
import { useSearchFilters } from "../../providers/SearchFiltersProvider";
import {
  formatRuntimeLabel,
  getDefaultRuntimeRange,
  RUNTIME_RANGE_MAX,
  RUNTIME_RANGE_MIN,
} from "../../types";

export function RuntimeFilter() {
  const { draftFilters, setDraftFilters } = useSearchFilters();
  const { runtimeError } = useFilterErrors();

  const { max: defaultRuntimeMax, min: defaultRuntimeMin } =
    getDefaultRuntimeRange();

  const runtimeRange = [
    draftFilters.runtimeMin ?? defaultRuntimeMin,
    draftFilters.runtimeMax ?? defaultRuntimeMax,
  ];

  const handleChange = (value: number | readonly number[]) => {
    const range = Array.isArray(value) ? value : [value, value];
    const [runtimeMin, runtimeMax] = range;

    setDraftFilters({
      ...draftFilters,
      runtimeMax,
      runtimeMin,
    });
  };

  return (
    <Field>
      <FieldLabel className="font-semibold mb-2">Runtime</FieldLabel>
      <Slider
        className="mb-1"
        max={RUNTIME_RANGE_MAX}
        min={RUNTIME_RANGE_MIN}
        onValueChange={handleChange}
        step={5}
        value={runtimeRange}
      />
      <div className="flex items-center gap-2 justify-between">
        <FieldDescription className="text-xs">
          {formatRuntimeLabel(runtimeRange[0] ?? defaultRuntimeMin)}
        </FieldDescription>
        <FieldDescription className="text-xs">
          {formatRuntimeLabel(runtimeRange[1] ?? defaultRuntimeMax)}
        </FieldDescription>
      </div>

      <ShowIf condition={!!runtimeError}>
        <FieldDescription className="text-destructive">
          {runtimeError}
        </FieldDescription>
      </ShowIf>
    </Field>
  );
}
