import type { LibraryItemFilters } from "@/lib/payload/queries/get-library-items";

import { PayloadClientError } from "@/lib/payload/client/payload-fetch";
import { getLibraryItems } from "@/lib/payload/queries/get-library-items";

export async function getInitialLibraryItems(
  clerkUserId: string,
  filters?: LibraryItemFilters,
) {
  let initialError: null | string = null;
  let initialLibraryItems: Awaited<ReturnType<typeof getLibraryItems>> = [];

  try {
    initialLibraryItems = await getLibraryItems(clerkUserId, filters);
  } catch (error) {
    if (error instanceof PayloadClientError && error.status === 404) {
      initialLibraryItems = [];
    } else if (error instanceof Error) {
      initialError = error.message;
    } else {
      initialError = "Failed to load library items";
    }
  }

  return { initialError, initialLibraryItems };
}
