/**
 * Up to two letters for an avatar fallback: first and last name, or the first two of a single name.
 *
 * Works on code points rather than UTF-16 units, so names that start with an emoji or another
 * astral character never produce a lone surrogate.
 *
 * @param name - Person display name
 * @returns Uppercase initials, or an empty string when the name is blank
 */
export function formatPersonInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter((part) => part.length > 0)
  const first = parts[0]
  const last = parts.at(-1)

  if (!first || !last) {
    return ''
  }

  if (parts.length === 1) {
    return Array.from(first).slice(0, 2).join('').toLocaleUpperCase()
  }

  return `${Array.from(first)[0] ?? ''}${Array.from(last)[0] ?? ''}`.toLocaleUpperCase()
}
