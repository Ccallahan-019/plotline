import { STREAMING_PLATFORM_REGISTRY } from '@plotline/shared/constants'
import { useMemo } from 'react'

import { Field, FieldContent, FieldLabel } from '@/components/ui/field'
import { SelectField } from '@/features/forms/components/SelectField'

type LogWatchPlatformPopoverFieldProps = {
  disabled?: boolean
  placeholder?: string
}

export function LogWatchPlatformPopoverField({
  disabled = false,
  placeholder = 'Select a platform...',
}: LogWatchPlatformPopoverFieldProps) {
  const items = useMemo(() => {
    return STREAMING_PLATFORM_REGISTRY.map((entry) => ({
      label: entry.label,
      value: entry.value,
    }))
  }, [])

  return (
    <Field className="items-center!" orientation="horizontal">
      <FieldLabel className="max-w-20">Platform</FieldLabel>
      <FieldContent>
        <SelectField disabled={disabled} items={items} placeholder={placeholder} />
      </FieldContent>
    </Field>
  )
}
