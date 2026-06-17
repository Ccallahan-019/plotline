import type { Review } from "@plotline/payload-types";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { fetchReviews } from "@/lib/query/services/api";
import { queryKeys, type ReviewFilters } from "@/lib/query/services/keys";

type UseReviewsOptions = {
  initialData?: Review[];
};

export function useReviews(
  filters?: ReviewFilters,
  options?: UseReviewsOptions,
) {
  return useQuery({
    initialData: options?.initialData,
    queryFn: () => fetchReviews(filters),
    queryKey: queryKeys.reviews(filters),
  } satisfies UseQueryOptions<Review[]>);
}
