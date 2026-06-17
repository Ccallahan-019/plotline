import type { LibraryItem } from "@plotline/payload-types";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { fetchLibraryItems } from "@/lib/query/services/api";
import { type LibraryFilters, queryKeys } from "@/lib/query/services/keys";

type UseLibraryItemsOptions = {
  initialData?: LibraryItem[];
};

export function useLibraryItems(
  filters?: LibraryFilters,
  options?: UseLibraryItemsOptions,
) {
  return useQuery({
    initialData: options?.initialData,
    queryFn: () => fetchLibraryItems(filters),
    queryKey: queryKeys.libraryItems(filters),
  } satisfies UseQueryOptions<LibraryItem[]>);
}
