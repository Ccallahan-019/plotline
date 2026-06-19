import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { AddToListResult } from "@/lib/payload/types/library-mutations";

import { postAddToLists } from "@/lib/query/services/api";
import { invalidateAfterLibraryMutation } from "@/lib/query/services/invalidate";

export function useAddToLists() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postAddToLists,
    onSuccess: (results: AddToListResult[]) => {
      invalidateAfterLibraryMutation(queryClient, {
        watchlistSlugs: results.map((result) => result.watchlist.slug),
      });
    },
  });
}
