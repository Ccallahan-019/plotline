/**
 * Writes `where[field][in][index]` params in the shape Payload's REST API expects.
 *
 * @param searchParams - Params object to add to. Modified in place
 * @param field - Field path to filter on
 * @param values - Values the field may match
 */
export function appendInFilter(
  searchParams: Record<string, number | string>,
  field: string,
  values: readonly (number | string)[],
) {
  values.forEach((value, index) => {
    searchParams[`where[${field}][in][${index}]`] = value
  })
}
