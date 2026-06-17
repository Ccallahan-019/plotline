import type { LibraryItem } from "@plotline/payload-types";
import type { QueryKey } from "@tanstack/react-query";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type {
  LogWatchInput,
  LogWatchResult,
} from "@/lib/payload/types/library-mutations";

import { postLogWatch } from "@/lib/query/services/api";
import { invalidateAfterLibraryMutation } from "@/lib/query/services/invalidate";

type LogWatchContext = {
  previousLibraryItems: ReadonlyArray<
    readonly [QueryKey, LibraryItem[] | undefined]
  >;
};

export function useLogWatch() {
  const queryClient = useQueryClient();

  return useMutation<LogWatchResult, Error, LogWatchInput, LogWatchContext>({
    mutationFn: (input: LogWatchInput) => postLogWatch(input),
    onError: (_error, _input, context) => {
      if (context?.previousLibraryItems) {
        for (const [queryKey, data] of context.previousLibraryItems) {
          queryClient.setQueryData(queryKey, data);
        }
      }
    },
    onMutate: async (input): Promise<LogWatchContext> => {
      await queryClient.cancelQueries({ queryKey: ["library-items"] });

      const previousLibraryItems = queryClient
        .getQueriesData<LibraryItem[]>({ queryKey: ["library-items"] })
        .map(([queryKey, data]) => [queryKey, data] as const);

      if (input.libraryItemStatus) {
        queryClient.setQueriesData<LibraryItem[]>(
          { queryKey: ["library-items"] },
          (items) =>
            items?.map((item) =>
              String(item.media) === String(input.mediaId) ||
              (typeof item.media === "object" &&
                item.media.id === Number(input.mediaId))
                ? { ...item, status: input.libraryItemStatus! }
                : item,
            ),
        );
      }

      return { previousLibraryItems };
    },
    onSettled: () => {
      invalidateAfterLibraryMutation(queryClient);
    },
  });
}
