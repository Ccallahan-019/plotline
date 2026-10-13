import { FieldError } from '@/components/ui/field'

import { useFieldContext } from '../contexts/form-contexts'

export function FormFieldError() {
  const {
    state: {
      meta: { errors },
    },
  } = useFieldContext()

  const formatedErrors = errors
    ?.map((error) => {
      if (formatError(error)) {
        return { message: error.message }
      }

      return { message: undefined }
    })
    .filter((error) => error.message != null)

  if (formatedErrors == null || formatedErrors.length === 0) {
    return null
  }

  return <FieldError errors={formatedErrors} />
}

function formatError(error: unknown): error is { message: string } {
  return (
    typeof error === 'object' &&
    error != null &&
    'message' in error &&
    typeof error.message === 'string'
  )
}
