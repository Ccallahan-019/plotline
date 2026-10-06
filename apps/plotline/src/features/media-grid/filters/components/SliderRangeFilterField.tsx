'use client'

import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Slider } from '@/components/ui/slider'
import { ShowIf } from '@/components/utils/ShowIf'

type SliderRangeFilterFieldProps = {
  error?: null | string
  formatValue?: (value: number) => string
  label: string
  max: number
  min: number
  onChange: (minValue: number, maxValue: number) => void
  range: [number, number]
  step?: number
}

export function SliderRangeFilterField({
  error,
  formatValue = String,
  label,
  max,
  min,
  onChange,
  range,
  step = 1,
}: SliderRangeFilterFieldProps) {
  const handleChange = (value: number | readonly number[]) => {
    const nextRange = Array.isArray(value) ? value : [value, value]
    const [minValue, maxValue] = nextRange

    if (minValue === undefined || maxValue === undefined) {
      return
    }

    onChange(minValue, maxValue)
  }

  return (
    <Field>
      <FieldLabel className="font-semibold mb-2">{label}</FieldLabel>
      <Slider
        className="mb-1"
        max={max}
        min={min}
        onValueChange={handleChange}
        step={step}
        value={range}
      />
      <div className="flex items-center gap-2 justify-between">
        <FieldDescription className="text-xs">{formatValue(range[0])}</FieldDescription>
        <FieldDescription className="text-xs">{formatValue(range[1])}</FieldDescription>
      </div>

      <ShowIf condition={!!error}>
        <FieldDescription className="text-destructive">{error}</FieldDescription>
      </ShowIf>
    </Field>
  )
}
