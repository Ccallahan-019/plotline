"use client";

import type { LibraryItem } from "@plotline/payload-types";

import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
} from "react";

import type { MediaDisplay } from "@/features/media/types";

import {
  buildLibraryItemLookupByTmdb,
  getLibraryItemForMediaDisplay,
} from "@/features/library/services/build-library-item-lookup";
import { useLibraryItems } from "@/lib/query/hooks/use-library-items";

type SearchLibraryItemsContextValue = {
  getLibraryItemForMedia: (media: MediaDisplay) => LibraryItem | undefined;
  isFetching: boolean;
  libraryItems: LibraryItem[];
  lookup: Map<string, LibraryItem>;
};

const SearchLibraryItemsContext =
  createContext<null | SearchLibraryItemsContextValue>(null);

type SearchLibraryItemsProviderProps = PropsWithChildren<{
  initialData: LibraryItem[];
}>;

export function SearchLibraryItemsProvider({
  children,
  initialData,
}: SearchLibraryItemsProviderProps) {
  const { data: libraryItems = initialData, isFetching } = useLibraryItems(
    undefined,
    { initialData },
  );

  const lookup = useMemo(
    () => buildLibraryItemLookupByTmdb(libraryItems),
    [libraryItems],
  );

  const getLibraryItemForMedia = useCallback(
    (media: MediaDisplay) => getLibraryItemForMediaDisplay(lookup, media),
    [lookup],
  );

  const value = useMemo(
    (): SearchLibraryItemsContextValue => ({
      getLibraryItemForMedia,
      isFetching,
      libraryItems,
      lookup,
    }),
    [getLibraryItemForMedia, isFetching, libraryItems, lookup],
  );

  return (
    <SearchLibraryItemsContext.Provider value={value}>
      {children}
    </SearchLibraryItemsContext.Provider>
  );
}

export function useSearchLibraryItems() {
  const context = useContext(SearchLibraryItemsContext);

  if (!context) {
    throw new Error(
      "useSearchLibraryItems must be used within SearchLibraryItemsProvider",
    );
  }

  return context;
}
