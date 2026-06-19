"use client";

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from "@/components/ui/combobox";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { ShowIf } from "@/components/utils/ShowIf";

import {
  EMPTY_DISABLED_WATCHLIST_IDS,
  useWatchlistField,
} from "../../hooks/use-watchlist-field";
import { WatchlistComboboxItem } from "../../types";

type AddToLibraryWatchlistFieldProps = {
  disabled?: boolean;
  disabledWatchlistIds?: Set<number>;
  error?: string;
  onChange: (watchlistIds: number[]) => void;
  selectedWatchlistIds: number[];
};

export function AddToLibraryWatchlistField({
  disabled = false,
  disabledWatchlistIds = EMPTY_DISABLED_WATCHLIST_IDS,
  error,
  onChange,
  selectedWatchlistIds,
}: AddToLibraryWatchlistFieldProps) {
  const {
    anchor,
    emptyContent,
    handleValueChange,
    items,
    placeholder,
    selectedItems,
  } = useWatchlistField({
    disabledWatchlistIds,
    onChange,
    selectedWatchlistIds,
  });

  return (
    <Field data-disabled={disabled}>
      <FieldLabel htmlFor="add-to-library-watchlists">Watchlists</FieldLabel>
      <FieldContent className="gap-1">
        <Combobox<WatchlistComboboxItem, true>
          disabled={disabled}
          isItemEqualToValue={(a, b) => a?.id === b?.id}
          items={items}
          itemToStringLabel={(item) => item?.label ?? ""}
          multiple
          onValueChange={handleValueChange}
          value={selectedItems}
        >
          <ComboboxChips ref={anchor}>
            <ComboboxValue>
              {(value: WatchlistComboboxItem[]) =>
                value.map((item) => (
                  <ComboboxChip key={item.id} showRemove={!item.disabled}>
                    {item.label}
                  </ComboboxChip>
                ))
              }
            </ComboboxValue>
            <ComboboxChipsInput
              aria-invalid={!!error}
              disabled={disabled}
              id="add-to-library-watchlists"
              placeholder={placeholder}
            />
          </ComboboxChips>

          <ComboboxContent anchor={anchor}>
            <ComboboxEmpty>{emptyContent}</ComboboxEmpty>
            <ComboboxList>
              {(item: WatchlistComboboxItem) => (
                <ComboboxItem
                  disabled={item.disabled || disabled}
                  key={item.id}
                  value={item}
                >
                  {item.label}
                  <ShowIf condition={!!item.disabled}>
                    <span className="text-muted-foreground"> (added)</span>
                  </ShowIf>
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        <FieldError>{error}</FieldError>
      </FieldContent>
    </Field>
  );
}
