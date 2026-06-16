export function getRelationId(
  value: { id: number | string } | null | number | string | undefined,
): null | number | string {
  if (value === null || value === undefined) {
    return null
  }

  if (typeof value === 'number' || typeof value === 'string') {
    return value
  }

  if (typeof value === 'object' && 'id' in value) {
    return value.id
  }

  return null
}

export function relationIdsMatch(
  left: { id: number | string } | null | number | string | undefined,
  right: { id: number | string } | null | number | string | undefined,
): boolean {
  const leftId = getRelationId(left)
  const rightId = getRelationId(right)

  if (left === null || left === undefined || right === null || right === undefined) {
    return false
  }

  return String(leftId) === String(rightId)
}
