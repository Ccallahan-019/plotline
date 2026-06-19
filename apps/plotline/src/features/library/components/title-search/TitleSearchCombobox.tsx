"use client";

import type { TmdbSearchResultItem } from "@plotline/shared/tmdb";

import { Search } from "lucide-react";

import type { MediaDisplay } from "@/features/media/types";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxList,
} from "@/components/ui/combobox";
import { InputGroupAddon } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { ShowIf } from "@/components/utils/ShowIf";

import { useTitleSearch } from "../../hooks/use-title-search";
import { TitleSearchComboboxItem } from "./TitleSearchComboboxItem";

type TitleSearchComboboxProps = {
  onSelect: (result: TmdbSearchResultItem) => void;
  placeholder?: string;
};

type TitleSearchItem = {
  display: MediaDisplay;
  id: string;
  label: string;
  result: TmdbSearchResultItem;
};

export function TitleSearchCombobox({
  onSelect,
  placeholder = "Search movies and TV…",
}: TitleSearchComboboxProps) {
  const {
    emptyMessage,
    handleInputValueChange,
    handleValueChange,
    isFetching,
    items,
  } = useTitleSearch({ onSelect });

  return (
    <Combobox<TitleSearchItem>
      autoHighlight
      isItemEqualToValue={(a, b) => a?.id === b?.id}
      items={items}
      itemToStringLabel={(item) => item?.label ?? ""}
      onInputValueChange={handleInputValueChange}
      onValueChange={handleValueChange}
    >
      <ComboboxInput
        className="w-full [&_[data-slot=input-group-control]]:pl-9"
        placeholder={placeholder}
        showClear
        showTrigger={false}
      >
        <InputGroupAddon align="inline-start">
          <Search />
        </InputGroupAddon>

        <ShowIf condition={isFetching}>
          <InputGroupAddon align="inline-end">
            <Spinner />
          </InputGroupAddon>
        </ShowIf>
      </ComboboxInput>

      <ComboboxContent>
        <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
        <ComboboxList>
          {(item: TitleSearchItem) => (
            <TitleSearchComboboxItem item={item} key={item.id} />
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
