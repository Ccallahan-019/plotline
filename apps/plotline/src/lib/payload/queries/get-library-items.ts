import type { LibraryItem } from "@plotline/payload-types";
import type { MediaStatus, MediaType } from "@plotline/shared/constants/media";

import {
  payloadFetch,
  type PayloadPaginatedDocs,
} from "../client/payload-fetch";

export type LibraryItemFilters = {
  mediaType?: MediaType;
  status?: MediaStatus;
};

export async function getLibraryItems(
  clerkUserId: string,
  filters?: LibraryItemFilters,
): Promise<LibraryItem[]> {
  const searchParams: Record<string, number | string> = {
    depth: 1,
    limit: 100,
    sort: "-lastWatchedAt",
  };

  if (filters?.status) {
    searchParams["where[status][equals]"] = filters.status;
  }

  if (filters?.mediaType) {
    searchParams["where[progress.type][equals]"] = filters.mediaType;
  }

  const result = await payloadFetch<PayloadPaginatedDocs<LibraryItem>>(
    "/api/library-items",
    {
      clerkUserId,
      method: "GET",
      searchParams,
    },
  );

  return result.docs;
}
