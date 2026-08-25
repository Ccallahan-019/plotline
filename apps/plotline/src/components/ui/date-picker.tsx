'use client'

import { format, isValid, startOfDay } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

import { ShowIf } from '../utils/ShowIf'

type DatePickerProps = {
  'aria-invalid'?: boolean
  calendarClassName?: string
  className?: string
  disabled?: boolean
  id?: string
  maxDate?: Date
  onChange: (date: Date | undefined) => void
  onOpenChange?: (open: boolean) => void
  placeholder?: string
  size?: 'default' | 'lg' | 'sm'
  value?: Date
}

function DatePicker({
  'aria-invalid': ariaInvalid,
  calendarClassName,
  className,
  disabled = false,
  id,
  maxDate,
  onChange,
  onOpenChange,
  placeholder = 'Pick a date',
  size = 'default',
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
    onOpenChange?.(nextOpen)
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
            size={size}
            type="button"
            variant="outline"
          />
        }
      >
        <CalendarIcon />
        {selectedDate ? format(selectedDate, 'PPP') : <span>{placeholder}</span>}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <ShowIf condition={open}>
          <Calendar
            // Do not autoFocus: the popup is portaled and not yet positioned,
            // so focusing a day would scroll the page to the top.
            captionLayout="dropdown"
            className={cn(calendarClassName, '[--cell-size:--spacing(10)]')}
            disabled={maxSelectableDate ? { after: maxSelectableDate } : undefined}
            endMonth={maxSelectableDate}
            mode="single"
            month={month}
            onMonthChange={setMonth}
            onSelect={handleSelect}
            selected={selectedDate}
          />
        </ShowIf>
      </PopoverContent>
    </Popover>
  )
}

function toValidDate(date: Date | undefined) {
  return date != null && isValid(date) ? date : undefined
}

export { DatePicker, type DatePickerProps }
