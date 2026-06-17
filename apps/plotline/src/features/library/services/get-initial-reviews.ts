import type { ReviewQueryFilters } from "@/lib/payload/queries/get-reviews";

import { PayloadClientError } from "@/lib/payload/client/payload-fetch";
import { getReviews } from "@/lib/payload/queries/get-reviews";

export async function getInitialReviews(
  clerkUserId: string,
  filters?: ReviewQueryFilters,
) {
  let initialError: null | string = null;
  let initialReviews: Awaited<ReturnType<typeof getReviews>> = [];

  try {
    initialReviews = await getReviews(clerkUserId, filters);
  } catch (error) {
    if (error instanceof PayloadClientError && error.status === 404) {
      initialReviews = [];
    } else if (error instanceof Error) {
      initialError = error.message;
    } else {
      initialError = "Failed to load reviews";
    }
  }

  return { initialError, initialReviews };
}
