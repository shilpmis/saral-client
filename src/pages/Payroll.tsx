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
import type { PayrollEntry } from "../types/payroll"
import { AddPayrollForm } from "@/components/Payroll/AddPayrollForm"
import { EditPayrollForm } from "@/components/Payroll/EditPayrollForm"
import { PayrollPolicy, Policy } from "@/components/Payroll/PayrollPolicy"

const initialPayrollData: PayrollEntry[] = [
  {
    id: 1,
    name: "John Doe",
    role: "Teacher",
    category: "teaching",
    active: true,
    salary: {
      basic: 2000,
      gradePay: 10000,
      inflation: 2000,
      houseRentAllowance: 1000,
      permanentTravel: 2000,
      medicalAllowance: 2000,
      localAllowance: 2000,
      principalsAllowance: 1000,
      supervisor: 2000,
      highMedianAllowance: 1000,
      cashAllowance: 1000,
      disabilityAllowance: 1000,
      chargeAllowance: 2000,
      transportAllowance: 1000,
      ncash: 2000,
      ltc: 1000,
      specialSalary: 1000,
      bonus: 1000,
      ariasAllowance: 2000,
      additionalInflation: 2000,
      interimRelief: 3000,
      other: 1000,
      otherSalaryReason: "",
    },
    deductions: {
      gpf: 2000,
      cpf: 0,
      gpfLoan: 1000,
      cpfLoan: 1000,
      housingLoan: 1000,
      incomeTax: 0,
      professionalTax: 1000,
      insuranceDeduction: 1000,
      grainAdvance: 1000,
      festivalPrelude: 1000,
      cooperativeSociety1: 1000,
      cooperativeSociety2: 1000,
      recovery: 1000,
      groupInsurance: 1000,
      retailDiscount1: 1000,
      additionalGPF: 1000,
      ple: 1000,
      otherDeductions: 1000,
      otherDeductionReason: "",
    },
    lastPayDate: "2023-05-01",
  },
  {
    id: 2,
    name: "Jane Smith",
    role: "Librarian",
    category: "non-teaching",
    active: true,
    salary: {
      basic: 1500,
      gradePay: 8000,
      inflation: 1500,
      houseRentAllowance: 1200,
      permanentTravel: 1500,
      medicalAllowance: 1800,
      localAllowance: 1700,
      principalsAllowance: 0,
      supervisor: 1800,
      highMedianAllowance: 1500,
      cashAllowance: 1500,
      disabilityAllowance: 0,
      chargeAllowance: 1200,
      transportAllowance: 1100,
      ncash: 1200,
      ltc: 1400,
      specialSalary: 0,
      bonus: 1200,
      ariasAllowance: 1000,
      additionalInflation: 1500,
      interimRelief: 2500,
      other: 0,
      otherSalaryReason: "",
    },
    deductions: {
      gpf: 1000,
      cpf: 0,
      gpfLoan: 800,
      cpfLoan: 0,
      housingLoan: 900,
      incomeTax: 500,
      professionalTax: 700,
      insuranceDeduction: 1200,
      grainAdvance: 0,
      festivalPrelude: 900,
      cooperativeSociety1: 1100,
      cooperativeSociety2: 0,
      recovery: 800,
      groupInsurance: 1000,
      retailDiscount1: 900,
      additionalGPF: 0,
      ple: 1000,
      otherDeductions: 1000,
      otherDeductionReason: "",
    },
    lastPayDate: "2023-06-15",
  },
  {
    id: 3,
    name: "Alice Johnson",
    role: "Science Teacher",
    category: "teaching",
    active: false,
    salary: {
      basic: 1800,
      gradePay: 9500,
      inflation: 1900,
      houseRentAllowance: 1300,
      permanentTravel: 1500,
      medicalAllowance: 1400,
      localAllowance: 1600,
      principalsAllowance: 0,
      supervisor: 1700,
      highMedianAllowance: 1600,
      cashAllowance: 1500,
      disabilityAllowance: 0,
      chargeAllowance: 0,
      transportAllowance: 1200,
      ncash: 1400,
      ltc: 1300,
      specialSalary: 0,
      bonus: 0,
      ariasAllowance: 1300,
      additionalInflation: 1200,
      interimRelief: 2200,
      other: 0,
      otherSalaryReason: "",
    },
    deductions: {
      gpf: 900,
      cpf: 0,
      gpfLoan: 800,
      cpfLoan: 0,
      housingLoan: 700,
      incomeTax: 600,
      professionalTax: 700,
      insuranceDeduction: 1000,
      grainAdvance: 0,
      festivalPrelude: 700,
      cooperativeSociety1: 800,
      cooperativeSociety2: 0,
      recovery: 600,
      groupInsurance: 900,
      retailDiscount1: 0,
      additionalGPF: 700,
      ple: 800,
      otherDeductions: 800,
      otherDeductionReason: "",
    },
    lastPayDate: "2023-04-20",
  },
  // 9 More Mock Data Entries Below (Truncated for Brevity)
];

export const Payroll: React.FC = () => {
  const [payrollData, setPayrollData] = useState<PayrollEntry[]>(initialPayrollData)
  const [isAddPayrollOpen, setIsAddPayrollOpen] = useState(false)
  const [isEditPayrollOpen, setIsEditPayrollOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<PayrollEntry | null>(null)
  const [policies, setPolicies] = useState<Policy[]>([])

  const handleAddPayroll = (newEntry: PayrollEntry) => {
    setPayrollData([...payrollData, { ...newEntry, id: payrollData.length + 1 }])
    setIsAddPayrollOpen(false)
  }

  const handleEditPayroll = (updatedEntry: PayrollEntry) => {
    setPayrollData(payrollData.map((entry) => (entry.id === updatedEntry.id ? updatedEntry : entry)))
    setIsEditPayrollOpen(false)
  }

  const handleDeletePayroll = (id: number) => {
    setPayrollData(payrollData.filter((entry) => entry.id !== id))
  }

  const handleToggleActive = (id: number) => {
    setPayrollData(payrollData.map((entry) => (entry.id === id ? { ...entry, active: !entry.active } : entry)))
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
    <div className="bg-white shadow-md rounded-lg p-6 max-w-full mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-primary mb-4 sm:mb-0">Payroll Management</h2>
        <div className="space-x-2">
          <Dialog open={isAddPayrollOpen} onOpenChange={setIsAddPayrollOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Payroll
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px]">
              <DialogHeader>
                <DialogTitle>Add New Payroll Entry</DialogTitle>
              </DialogHeader>
              <AddPayrollForm
                onSubmit={handleAddPayroll}
                onCancel={() => setIsAddPayrollOpen(false)}
                policies={policies}
              />
            </DialogContent>
          </Dialog>
          <Button variant="outline">
            <FileDown className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      <PayrollPolicy />

      <div className="mt-8">
        <div className="w-full overflow-auto">
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
        </div>
      </div>

      <Dialog open={isEditPayrollOpen} onOpenChange={setIsEditPayrollOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Edit Payroll Entry</DialogTitle>
          </DialogHeader>
          {selectedEntry && (
            <EditPayrollForm
            //   entry={selectedEntry}
              onSubmit={handleEditPayroll}
              onCancel={() => setIsEditPayrollOpen(false)}
              policies={policies}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

