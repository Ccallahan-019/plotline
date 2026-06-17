import { payloadFetch } from "../client/payload-fetch";
import { AddToListInput, AddToListResult } from "../types/library-mutations";

export async function addToList(
  clerkUserId: string,
  input: AddToListInput,
): Promise<AddToListResult> {
  return payloadFetch<AddToListResult>("/api/library/add-to-list", {
    body: input,
    clerkUserId,
    method: "POST",
  });
}
