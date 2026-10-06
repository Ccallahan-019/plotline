export function toNonNegativeInteger(value: unknown): null | number {
  if (typeof value === 'string' && value.trim() !== '') {
    return toNonNegativeInteger(Number(value))
  }

  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
    return null
  }

  return value
}
