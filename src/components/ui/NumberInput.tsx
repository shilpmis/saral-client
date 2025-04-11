// import type React from "react"
// import { useState } from "react"
// import { Input } from "@/components/ui/input"

// // Define InputProps locally if not exported from "@/components/ui/input"
// interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

// interface NumberInputProps extends Omit<InputProps, "onChange" | "value"> {
//   value?: string | undefined
//   onChange?: (value: string | undefined) => void
//   decimal?: boolean // Add decimal prop
//   decimalPlaces?: number // Number of decimal places to maintain
// }

// const NumberInput: React.FC<NumberInputProps> = ({ value, onChange, decimal = false, decimalPlaces = 2, ...props }) => {
//   const [isFocused, setIsFocused] = useState(false)

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const inputValue = e.target.value

//     // Allow empty input
//     if (inputValue === "") {
//       onChange?.("")
//       return
//     }

//     // Handle decimal point input
//     if (decimal && inputValue === ".") {
//       onChange?.("0.")
//       return
//     }

//     // Regular expression for validating numbers
//     // For decimal mode: allow digits followed by optional decimal point and more digits
//     // For integer mode: allow only digits
//     const regex = decimal ? /^\d*\.?\d*$/ : /^\d*$/

//     if (regex.test(inputValue)) {
//       onChange?.(inputValue)
//     }
//   }

//   // Format the displayed value only when the field is not focused
//   const formatValue = () => {
//     if (value === undefined || value === "") return ""

//     // When focused, show the raw input value
//     if (isFocused) return value

//     // When not focused and decimal mode is enabled
//     if (decimal) {
//       const numValue = Number.parseFloat(value)

//       // Only format as decimal if the value contains a decimal point
//       // or if it's a whole number and we're not focused
//       if (!isNaN(numValue) && !isFocused && (value.includes(".") || !isFocused)) {
//         return numValue.toFixed(decimalPlaces)
//       }
//     }

//     return value
//   }

//   return (
//     <Input
//       type="text"
//       inputMode={decimal ? "decimal" : "numeric"}
//       pattern={decimal ? "[0-9]*[.,]?[0-9]*" : "[0-9]*"}
//       value={formatValue()}
//       onChange={handleChange}
//       onFocus={() => setIsFocused(true)}
//       onBlur={() => {
//         setIsFocused(false)
//         // Format the value with decimal places on blur if decimal mode is enabled
//         // and the value actually contains a decimal point
//         if (decimal && value && value.includes(".")) {
//           const numValue = Number.parseFloat(value)
//           if (!isNaN(numValue)) {
//             onChange?.(numValue.toFixed(decimalPlaces))
//           }
//         }
//       }}
//       {...props}
//     />
//   )
// }

// export default NumberInput
"use client"

import type React from "react"
import { Input } from "@/components/ui/input"

// Define InputProps locally if not exported from "@/components/ui/input"
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

interface NumberInputProps extends Omit<InputProps, "onChange" | "value"> {
  value?: string | undefined
  onChange?: (value: string | undefined) => void
  decimal?: boolean // Add decimal prop
  decimalPlaces?: number // Number of decimal places to maintain
}

const NumberInput: React.FC<NumberInputProps> = ({ value, onChange, decimal = false, decimalPlaces = 2, ...props }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value

    // Allow empty input
    if (inputValue === "") {
      onChange?.("")
      return
    }

    // Handle decimal point input
    if (decimal && inputValue === ".") {
      onChange?.("0.")
      return
    }

    // For non-decimal mode, only allow digits
    if (!decimal) {
      if (/^\d*$/.test(inputValue)) {
        onChange?.(inputValue)
      }
      return
    }

    // For decimal mode, enforce decimal place limit
    if (inputValue.includes(".")) {
      const [whole, fraction] = inputValue.split(".")

      // Check if the whole part is valid
      if (!/^\d*$/.test(whole)) return

      // Check if the fraction part is valid and doesn't exceed the decimal place limit
      if (!/^\d*$/.test(fraction) || fraction.length > decimalPlaces) return

      onChange?.(inputValue)
    } else {
      // No decimal point yet, just validate it's a number
      if (/^\d*$/.test(inputValue)) {
        onChange?.(inputValue)
      }
    }
  }

  return (
    <Input
      type="text"
      inputMode={decimal ? "decimal" : "numeric"}
      pattern={decimal ? `[0-9]*[.,]?[0-9]{0,${decimalPlaces}}` : "[0-9]*"}
      value={value || ""}
      onChange={handleChange}
      {...props}
    />
  )
}

export default NumberInput
