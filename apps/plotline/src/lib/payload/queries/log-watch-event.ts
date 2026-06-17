import { payloadFetch } from "../client/payload-fetch";
import { LogWatchInput, LogWatchResult } from "../types/library-mutations";

export async function logWatchEvent(
  clerkUserId: string,
  input: LogWatchInput,
): Promise<LogWatchResult> {
  return payloadFetch<LogWatchResult>("/api/library/log-watch", {
    body: input,
    clerkUserId,
    method: "POST",
  });
}
