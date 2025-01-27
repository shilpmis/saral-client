import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { MoreHorizontal, Plus, FileDown, Pencil, Trash, ToggleLeft, ToggleRight } from "lucide-react"
import { PayrollEntry } from "@/types/payroll"
import { AddPayrollForm } from "@/components/Payroll/AddPayrollForm"
import { EditPayrollForm } from "@/components/Payroll/EditPayrollForm"
import { PayrollPolicy, Policy } from "@/components/Payroll/PayrollPolicy"



export default function PayrollTable({payrollData} : {payrollData : PayrollEntry[]}) {

      const [isAddPayrollOpen, setIsAddPayrollOpen] = useState(false)
      const [isEditPayrollOpen, setIsEditPayrollOpen] = useState(false)
      const [selectedEntry, setSelectedEntry] = useState<PayrollEntry | null>(null)
      const [policies, setPolicies] = useState<Policy[]>([])

      const handleDeletePayroll = (id: number) => {
        // setPayrollData(payrollData.filter((entry) => entry.id !== id))
      }
    
      const handleToggleActive = (id: number) => {
        // setPayrollData(payrollData.map((entry) => (entry.id === id ? { ...entry, active: !entry.active } : entry)))
      }
    
      // Function to calculate total salary
      const calculateTotalSalary = (salary: PayrollEntry["salary"]) => {
        return Object.entries(salary).reduce((sum, [key, value]) => {
          return typeof value === "number" ? sum + value : sum;
        }, 0);
      };
      
      // Function to calculate total deductions
      const calculateTotalDeductions = (deductions: PayrollEntry["deductions"]) => {
        return Object.entries(deductions).reduce((sum, [key, value]) => {
          return typeof value === "number" ? sum + value : sum;
        }, 0);
      };

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Total Salary</TableHead>
                    <TableHead>Total Deductions</TableHead>
                    <TableHead>Net Salary</TableHead>
                    <TableHead>Last Pay Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {payrollData.map((entry) => {
                    const totalSalary = calculateTotalSalary(entry.salary)
                    const totalDeductions = calculateTotalDeductions(entry.deductions)
                    const netSalary = totalSalary - totalDeductions

                    return (
                        <TableRow key={entry.id}>
                            <TableCell>{entry.name}</TableCell>
                            <TableCell>{entry.role}</TableCell>
                            <TableCell>{entry.category}</TableCell>
                            <TableCell>₹{totalSalary.toLocaleString()}</TableCell>
                            <TableCell>₹{totalDeductions.toLocaleString()}</TableCell>
                            <TableCell>₹{netSalary.toLocaleString()}</TableCell>
                            <TableCell>{entry.lastPayDate}</TableCell>
                            <TableCell>{entry.active ? "Active" : "Inactive"}</TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem
                                            onClick={() => {
                                                setSelectedEntry(entry)
                                                setIsEditPayrollOpen(true)
                                            }}
                                        >
                                            <Pencil className="mr-2 h-4 w-4" />
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleToggleActive(entry.id)}>
                                            {entry.active ? (
                                                <>
                                                    <ToggleLeft className="mr-2 h-4 w-4" />
                                                    Deactivate
                                                </>
                                            ) : (
                                                <>
                                                    <ToggleRight className="mr-2 h-4 w-4" />
                                                    Activate
                                                </>
                                            )}
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => handleDeletePayroll(entry.id)}>
                                            <Trash className="mr-2 h-4 w-4" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    )
                })}
            </TableBody>
        </Table>
    )
}
