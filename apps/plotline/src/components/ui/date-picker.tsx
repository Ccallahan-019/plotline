'use client'

import { format, isValid, startOfDay } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

type DatePickerProps = {
  'aria-invalid'?: boolean
  className?: string
  disabled?: boolean
  id?: string
  maxDate?: Date
  onChange: (date: Date | undefined) => void
  placeholder?: string
  value?: Date
}

function DatePicker({
  'aria-invalid': ariaInvalid,
  className,
  disabled = false,
  id,
  maxDate,
  onChange,
  placeholder = 'Pick a date',
  value,
}: DatePickerProps) {
  const selectedDate = toValidDate(value)
  const maxSelectableDate = toValidDate(maxDate)
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState(selectedDate)
  const [prevValueTime, setPrevValueTime] = useState(selectedDate?.getTime())

  if (selectedDate?.getTime() !== prevValueTime) {
    setPrevValueTime(selectedDate?.getTime())
    if (selectedDate) {
      setMonth(selectedDate)
    }
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setMonth(selectedDate ?? maxSelectableDate ?? startOfDay(new Date()))
    }
    setOpen(nextOpen)
  }

  const handleSelect = (date: Date | undefined) => {
    onChange(date)
    setOpen(false)
  }

  return (
    <Popover modal={false} onOpenChange={handleOpenChange} open={open}>
      <PopoverTrigger
        aria-invalid={ariaInvalid}
        disabled={disabled}
        id={id}
        render={
          <Button
            className={cn(
              'w-full justify-start text-left font-normal',
              !selectedDate && 'text-muted-foreground',
              className,
            )}
            disabled={disabled}
            type="button"
            variant="outline"
          />
        }
      >
        <CalendarIcon />
        {selectedDate ? format(selectedDate, 'PPP') : <span>{placeholder}</span>}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        {open ? (
          <Calendar
            autoFocus
            captionLayout="dropdown"
            disabled={maxSelectableDate ? { after: maxSelectableDate } : undefined}
            endMonth={maxSelectableDate}
            mode="single"
            month={month}
            onMonthChange={setMonth}
            onSelect={handleSelect}
            selected={selectedDate}
          />
        ) : null}
      </PopoverContent>
    </Popover>
  )
}

function toValidDate(date: Date | undefined) {
  return date != null && isValid(date) ? date : undefined
}

export { DatePicker, type DatePickerProps }
