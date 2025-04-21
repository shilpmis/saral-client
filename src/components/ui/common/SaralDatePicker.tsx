"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface SaralDatePickerProps {
  date: Date | undefined
  onDateChange: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  disableFutureDates?: boolean
  disablePastDates?: boolean
  fromYear?: number
  toYear?: number
}

export function SaralDatePicker({
  date,
  onDateChange,
  placeholder = "Pick a date",
  className,
  disabled = false,
  disableFutureDates = false,
  disablePastDates = false,
  fromYear,
  toYear,
}: SaralDatePickerProps) {
  // Function to determine which dates should be disabled
  const isDateDisabled = React.useCallback(
    (date: Date) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (disableFutureDates && date > today) {
        return true
      }

      if (disablePastDates && date < today) {
        return true
      }

      return false
    },
    [disableFutureDates, disablePastDates],
  )

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-full h-9 justify-start text-left font-normal", !date && "text-muted-foreground", className)}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(selectedDate) => {
            // Ensure we're properly handling the date selection
            onDateChange(selectedDate)
          }}
          disabled={isDateDisabled}
          initialFocus
          fromYear={fromYear}
          toYear={toYear}
        />
      </PopoverContent>
    </Popover>
  )
}
