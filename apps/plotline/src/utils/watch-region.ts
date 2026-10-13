export const DEFAULT_WATCH_REGION = 'US'

export function parseWatchRegionOverride(value: null | string): string | undefined {
  const trimmed = value?.trim()

  if (!trimmed || !/^[A-Za-z]{2}$/.test(trimmed)) {
    return undefined
  }

  return trimmed.toUpperCase()
}

export function resolveProfileWatchRegion(region?: null | string): string {
  const trimmed = region?.trim()

  if (trimmed && trimmed.length >= 2) {
    return trimmed.toUpperCase()
  }

  return DEFAULT_WATCH_REGION
}
