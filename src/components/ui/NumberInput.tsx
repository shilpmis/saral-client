import React from "react";
import { Input } from "@/components/ui/input";

// Define InputProps locally if not exported from "@/components/ui/input"
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

interface NumberInputProps extends Omit<InputProps, "onChange" | "value"> {
    value?: string;
    onChange?: (value: string | undefined) => void;
    decimal?: boolean; // Add decimal prop
}

const NumberInput: React.FC<NumberInputProps> = ({ value, onChange, decimal = false, ...props }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;

        // Allow empty input or valid decimal numbers
        if (inputValue === "" || (decimal && inputValue === ".")) {
            console.log("inputValue 1" ,  inputValue)
            onChange?.(inputValue);
        } else if (decimal ? /^[0-9]*\.?[0-9]*$/.test(inputValue) : /^[0-9]*$/.test(inputValue)) {
            // Validate input as a string to preserve formatting
            console.log("inputValue 2" ,  inputValue)
            onChange?.(inputValue);
        } else {
            onChange?.(undefined); // Handle invalid input gracefully
        }
    };

    return (
        <Input
            type="text"
            inputMode={decimal ? "decimal" : "numeric"}
            pattern={decimal ? "[0-9]*[.,]?[0-9]*" : "[0-9]*"}
            value={value !== undefined ? value : ""}
            onChange={handleChange}
            {...props}
        />
    );
};

export default NumberInput;
