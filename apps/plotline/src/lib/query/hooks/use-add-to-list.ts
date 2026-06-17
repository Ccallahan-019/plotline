import { useMutation, useQueryClient } from "@tanstack/react-query";

import type {
  AddToListInput,
  AddToListResult,
} from "@/lib/payload/types/library-mutations";

import { postAddToList } from "@/lib/query/services/api";
import { invalidateAfterLibraryMutation } from "@/lib/query/services/invalidate";

export function useAddToList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AddToListInput) => postAddToList(input),
    onSuccess: (result: AddToListResult) => {
      invalidateAfterLibraryMutation(queryClient, {
        watchlistSlug: result.watchlist.slug,
      });
    },
  });
}
