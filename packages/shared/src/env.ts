import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export type SharedEnv = ReturnType<typeof createSharedEnv>;

/**
 * Shared server-side env validation. Apps pass their runtime env object
 * so the same schema can be reused in plotline BFF routes and payload jobs.
 */
export function createSharedEnv(
  runtimeEnv: Record<string, string | undefined>,
) {
  return createEnv({
    emptyStringAsUndefined: true,
    runtimeEnv,
    server: {
      TMDB_API_KEY: z.string().min(1),
      TMDB_READ_ACCESS_TOKEN: z.string().min(1).optional(),
    },
  });
}
