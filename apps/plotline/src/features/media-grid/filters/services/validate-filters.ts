import type { FilterDefinition, FilterValidationErrors, MediaFilters } from '../types'

export function hasValidationErrors(errors: FilterValidationErrors): boolean {
  return Object.values(errors).some((message) => message !== null)
}

export function validateFilters(
  filters: MediaFilters,
  definitions: FilterDefinition[],
): FilterValidationErrors {
  const errors: FilterValidationErrors = {}

  for (const definition of definitions) {
    if (!definition.validate) {
      continue
    }

    const fieldErrors = definition.validate(filters)

    for (const [key, message] of Object.entries(fieldErrors)) {
      if (message) {
        errors[key] = message
      }
    }
  }

  return errors
}
