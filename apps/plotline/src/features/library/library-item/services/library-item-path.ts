// Payload custom route for one library item, with the id path-encoded.
export function libraryItemPath(libraryItemId: string): string {
  return `/api/library/library-items/${encodeURIComponent(libraryItemId)}`
}
