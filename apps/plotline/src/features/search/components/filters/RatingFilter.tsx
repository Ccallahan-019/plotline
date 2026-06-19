"use client";

import {
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ShowIf } from "@/components/utils/ShowIf";

import { useFilterErrors } from "../../providers/FilterErrorsProvider";
import { useSearchFilters } from "../../providers/SearchFiltersProvider";

export function RatingFilter() {
  const { draftFilters, setDraftFilters } = useSearchFilters();
  const { ratingError } = useFilterErrors();

  const handleMinChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setDraftFilters({
      ...draftFilters,
      ratingMin: value === "" ? undefined : Number(value),
    });
  };

  const handleMaxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setDraftFilters({
      ...draftFilters,
      ratingMax: value === "" ? undefined : Number(value),
    });
  };

  return (
    <Field>
      <FieldLabel className="font-semibold mb-2">Rating</FieldLabel>
      <FieldGroup className="grid grid-cols-2 gap-3">
        <Field>
          <Input
            id="rating-min"
            max={10}
            min={0}
            onChange={handleMinChange}
            placeholder="Min"
            step={0.1}
            type="number"
            value={draftFilters.ratingMin ?? ""}
          />
        </Field>
        <Field>
          <Input
            id="rating-max"
            max={10}
            min={0}
            onChange={handleMaxChange}
            placeholder="Max"
            step={0.1}
            type="number"
            value={draftFilters.ratingMax ?? ""}
          />
        </Field>
      </FieldGroup>

      <ShowIf condition={!!ratingError}>
        <FieldDescription className="text-destructive">
          {ratingError}
        </FieldDescription>
      </ShowIf>
    </Field>
  );
}
