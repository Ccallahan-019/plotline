import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";

import { Genre, WatchProvider } from "../../types";

type FilterCheckboxProps = {
  fieldIdPrefix?: string;
  filterItem: Genre | WatchProvider;
  isChecked: boolean;
  onToggle: (filterItemId: number, checked: boolean) => void;
};

export function FilterCheckbox({
  fieldIdPrefix = "genre",
  filterItem,
  isChecked,
  onToggle,
}: FilterCheckboxProps) {
  const fieldId = `${fieldIdPrefix}-${filterItem.id}`;

  return (
    <Field orientation="horizontal">
      <Checkbox
        checked={isChecked}
        id={fieldId}
        onCheckedChange={(checked) => onToggle(filterItem.id, checked === true)}
      />
      <FieldLabel
        className={cn(!isChecked && "text-muted-foreground")}
        htmlFor={fieldId}
      >
        {filterItem.name}
      </FieldLabel>
    </Field>
  );
}
