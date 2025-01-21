import type React from "react"
import { useForm, Controller } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import type { PayrollEntry } from "../../types/payroll"
import type { Policy } from "./PayrollPolicy"

interface EditPayrollFormProps {
    onSubmit: (data: PayrollEntry) => void
    onCancel: () => void
    policies: Policy[]
}

export const EditPayrollForm: React.FC<EditPayrollFormProps> = ({ onSubmit, onCancel, policies }) => {
   const { register, handleSubmit, control, watch, setValue } = useForm<PayrollEntry & { policyId: string }>()
    const selectedPolicyId = watch("policyId")
    const selectedPolicy = policies.find((p) => p.id === selectedPolicyId)
  
    const onPolicyChange = (policyId: string) => {
      const policy = policies.find((p) => p.id === policyId)
      if (policy) {
        setValue("salary", policy.salary)
        setValue("deductions", policy.deductions)
      }
    }

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
        <div className="flex items-center space-x-2">
          <Switch id="active" {...register("active")} />
          <Label htmlFor="active">Active</Label>
        </div>
      </div>

      <div>
        <Label htmlFor="policyId">Payroll Policy</Label>
        <Controller
          name="policyId"
          control={control}
          render={({ field }) => (
            <Select
              onValueChange={(value) => {
                field.onChange(value)
                onPolicyChange(value)
              }}
              value={field.value}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select policy" />
              </SelectTrigger>
              <SelectContent>
                {policies.map((policy) => (
                  <SelectItem key={policy.id} value={policy.id}>
                    {policy.policyName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <Tabs defaultValue="salary" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="salary">Salary</TabsTrigger>
          <TabsTrigger value="deductions">Deductions</TabsTrigger>
        </TabsList>
        <TabsContent value="salary" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {selectedPolicy &&
              Object.keys(selectedPolicy.salary).map((key) => (
                <div key={key}>
                  <Label htmlFor={`salary.${key}`}>{key}</Label>
                  <Input
                    id={`salary.${key}`}
                    type={key === "otherSalaryReason" ? "text" : "number"}
                    {...register(`salary.${key as keyof PayrollEntry["salary"]}`, {
                      required: true,
                      valueAsNumber: key !== "otherSalaryReason",
                    })}
                  />
                </div>
              ))}
          </div>
        </TabsContent>
        <TabsContent value="deductions" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {selectedPolicy &&
              Object.keys(selectedPolicy.deductions).map((key) => (
                <div key={key}>
                  <Label htmlFor={`deductions.${key}`}>{key}</Label>
                  <Input
                    id={`deductions.${key}`}
                    type={key === "otherDeductionReason" ? "text" : "number"}
                    {...register(`deductions.${key as keyof PayrollEntry["deductions"]}`, {
                      required: true,
                      valueAsNumber: key !== "otherDeductionReason",
                    })}
                  />
                </div>
              ))}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Update Payroll</Button>
      </div>
    </form>
  )
}

