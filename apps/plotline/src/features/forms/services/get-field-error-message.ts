export function getFieldErrorMessage(errors: readonly unknown[]): string | undefined {
  if (errors.length === 0) {
    return undefined
  }

  const messages = errors
    .map((error) => {
      if (typeof error === 'string') {
        return error
      }

      if (error != null && typeof error === 'object' && 'message' in error) {
        const message = error.message
        return typeof message === 'string' ? message : undefined
      }

      return undefined
    })
    .filter((message): message is string => message != null)

  if (messages.length === 0) {
    return undefined
  }

  return messages.join(', ')
}
