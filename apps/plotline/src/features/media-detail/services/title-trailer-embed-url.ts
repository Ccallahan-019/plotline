/** Privacy-enhanced YouTube embed URL for a title trailer key. */
export function titleTrailerEmbedUrl(key: string): string {
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(key)}`
}
