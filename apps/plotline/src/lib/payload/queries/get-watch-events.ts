import type { WatchEvent } from "@plotline/payload-types";

import {
  payloadFetch,
  type PayloadPaginatedDocs,
} from "../client/payload-fetch";

export type WatchEventQueryFilters = {
  limit?: number;
  sort?: string;
};

export async function getWatchEvents(
  clerkUserId: string,
  filters?: WatchEventQueryFilters,
): Promise<WatchEvent[]> {
  const result = await payloadFetch<PayloadPaginatedDocs<WatchEvent>>(
    "/api/watch-events",
    {
      clerkUserId,
      method: "GET",
      searchParams: {
        depth: 1,
        limit: filters?.limit ?? 20,
        sort: filters?.sort ?? "-watchedAt",
      },
    },
  );

  return result.docs;
}
