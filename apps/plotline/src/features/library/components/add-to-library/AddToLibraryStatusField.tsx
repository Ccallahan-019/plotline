"use client";

import type { MediaStatus } from "@plotline/shared/constants/media";

import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { MEDIA_STATUS_OPTIONS } from "@/features/library/constants/media-status-options";

type AddToLibraryStatusFieldProps = {
  disabled?: boolean;
  error?: string;
  onChange: (status: MediaStatus) => void;
  value: MediaStatus;
};

export function AddToLibraryStatusField({
  disabled = false,
  error,
  onChange,
  value,
}: AddToLibraryStatusFieldProps) {
  const handleValueChange = (nextValue: MediaStatus | null) => {
    if (nextValue) {
      onChange(nextValue);
    }
  };

  const triggerContent =
    MEDIA_STATUS_OPTIONS.find((option) => option.value === value)?.label ??
    "Select status";

  return (
    <Field data-disabled={disabled}>
      <FieldLabel htmlFor="add-to-library-status">Status</FieldLabel>
      <FieldContent>
        <Select
          disabled={disabled}
          onValueChange={handleValueChange}
          value={value}
        >
          <SelectTrigger
            aria-invalid={!!error}
            className="w-full"
            id="add-to-library-status"
          >
            {triggerContent}
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false} className="p-1">
            {MEDIA_STATUS_OPTIONS.map((option) => {
              if (option.value !== "dropped") {
                return (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                );
              }
            })}
          </SelectContent>
        </Select>
        <FieldError>{error}</FieldError>
      </FieldContent>
    </Field>
  );
}
