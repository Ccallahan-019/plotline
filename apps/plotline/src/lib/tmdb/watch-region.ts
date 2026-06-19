export const DEFAULT_WATCH_REGION = "US";

export function resolveProfileWatchRegion(region?: null | string): string {
  const trimmed = region?.trim();

  if (trimmed && trimmed.length >= 2) {
    return trimmed.toUpperCase();
  }

  return DEFAULT_WATCH_REGION;
}
