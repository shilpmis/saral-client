import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"


interface SaralDatePickerProps {
  date: Date | undefined; // Optional date prop
  onDateChange: (date: Date | undefined) => void; // Add a callback for date changes
}

export function SaralDatePicker({ date: initialDate, onDateChange }: SaralDatePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(initialDate)

  const handleSelectDate = (newDate: Date | undefined) => {
    setDate(newDate)
    onDateChange(newDate)
  }
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[240px] justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(date) => {
            handleSelectDate(date)
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
