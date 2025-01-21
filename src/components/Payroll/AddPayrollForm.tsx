import type React from "react"
import { useForm, Controller } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { PayrollEntry } from "../../types/payroll"

interface AddPayrollFormProps {
  onSubmit: (data: PayrollEntry) => void
  onCancel: () => void
}

export const AddPayrollForm: React.FC<AddPayrollFormProps> = ({ onSubmit, onCancel }) => {
  const { register, handleSubmit, control } = useForm<PayrollEntry>()

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...register("name", { required: true })} />
        </div>
        <div>
          <Label htmlFor="role">Role</Label>
          <Input id="role" {...register("role", { required: true })} />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Controller
            name="category"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="teaching">Teaching</SelectItem>
                  <SelectItem value="non-teaching">Non-Teaching</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div>
          <Label htmlFor="lastPayDate">Last Pay Date</Label>
          <Input id="lastPayDate" type="date" {...register("lastPayDate", { required: true })} />
        </div>
      </div>

      <Tabs defaultValue="salary" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="salary">Salary</TabsTrigger>
          <TabsTrigger value="deductions">Deductions</TabsTrigger>
        </TabsList>
        <TabsContent value="salary" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="salary.basic">Basic</Label>
              <Input id="salary.basic" type="number" {...register("salary.basic", { required: true, min: 0 })} />
            </div>
            <div>
              <Label htmlFor="salary.gradePay">Grade Pay</Label>
              <Input id="salary.gradePay" type="number" {...register("salary.gradePay", { required: true, min: 0 })} />
            </div>
            <div>
              <Label htmlFor="salary.inflation">Inflation</Label>
              <Input
                id="salary.inflation"
                type="number"
                {...register("salary.inflation", { required: true, min: 0 })}
              />
            </div>
            <div>
              <Label htmlFor="salary.houseRentAllowance">House Rent Allowance</Label>
              <Input
                id="salary.houseRentAllowance"
                type="number"
                {...register("salary.houseRentAllowance", { required: true, min: 0 })}
              />
            </div>
            {/* Add all other salary fields here */}
            <div>
              <Label htmlFor="salary.other">Other</Label>
              <Input id="salary.other" type="number" {...register("salary.other", { required: true, min: 0 })} />
            </div>
            <div>
              <Label htmlFor="salary.otherSalaryReason">Other Salary Reason</Label>
              <Input id="salary.otherSalaryReason" {...register("salary.otherSalaryReason")} />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="deductions" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="deductions.gpf">GPF</Label>
              <Input id="deductions.gpf" type="number" {...register("deductions.gpf", { required: true, min: 0 })} />
            </div>
            <div>
              <Label htmlFor="deductions.cpf">CPF</Label>
              <Input id="deductions.cpf" type="number" {...register("deductions.cpf", { required: true, min: 0 })} />
            </div>
            <div>
              <Label htmlFor="deductions.gpfLoan">GPF Loan</Label>
              <Input
                id="deductions.gpfLoan"
                type="number"
                {...register("deductions.gpfLoan", { required: true, min: 0 })}
              />
            </div>
            <div>
              <Label htmlFor="deductions.cpfLoan">CPF Loan</Label>
              <Input
                id="deductions.cpfLoan"
                type="number"
                {...register("deductions.cpfLoan", { required: true, min: 0 })}
              />
            </div>
            {/* Add all other deduction fields here */}
            <div>
              <Label htmlFor="deductions.otherDeductions">Other Deductions</Label>
              <Input
                id="deductions.otherDeductions"
                type="number"
                {...register("deductions.otherDeductions", { required: true, min: 0 })}
              />
            </div>
            <div>
              <Label htmlFor="deductions.otherDeductionReason">Other Deduction Reason</Label>
              <Input id="deductions.otherDeductionReason" {...register("deductions.otherDeductionReason")} />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Add Payroll</Button>
      </div>
    </form>
  )
}

