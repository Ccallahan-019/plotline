import { FetchJsonError } from "@/lib/api/fetch-json";

export function getErrorMessage(error: Error | null) {
  const errorMessage =
    error instanceof FetchJsonError
      ? typeof error.body === "object" &&
        error.body !== null &&
        "error" in error.body &&
        typeof error.body.error === "string"
        ? error.body.error
        : error.message
      : error instanceof Error
        ? error.message
        : null;

  return errorMessage;
}
