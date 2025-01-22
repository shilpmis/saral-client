import React from "react"
import { useForm, Controller } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StudentFee } from "./StudentFeeManagement"

interface StudentFeeFormProps {
  onSubmit: (data: StudentFee) => void
  initialData?: StudentFee | null
}

const defaultStudentFee: StudentFee = {
  id: "",
  studentName: "",
  grNumber: "",
  standard: 1,
  totalFees: 0,
  totalAmountPaid: 0,
  outstandingAmount: 0,
  isActive: true,
}

export const StudentFeeForm: React.FC<StudentFeeFormProps> = ({ onSubmit, initialData }) => {
  const { register, handleSubmit, control, watch, setValue } = useForm<StudentFee>({
    defaultValues: initialData || defaultStudentFee,
  })

  const watchedFields = watch()

  React.useEffect(() => {
    const totalFees = watchedFields.totalFees || 0
    const totalAmountPaid = watchedFields.totalAmountPaid || 0
    setValue("outstandingAmount", totalFees - totalAmountPaid)
  }, [watchedFields.totalFees, watchedFields.totalAmountPaid, setValue])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="studentName">Student Name</Label>
          <Input id="studentName" {...register("studentName", { required: true })} />
        </div>
        <div>
          <Label htmlFor="grNumber">GR Number</Label>
          <Input id="grNumber" {...register("grNumber", { required: true })} />
        </div>
        <div>
          <Label htmlFor="standard">Standard</Label>
          <Controller
            name="standard"
            control={control}
            render={({ field }) => (
              <Select onValueChange={(value) => field.onChange(Number.parseInt(value))} value={field.value.toString()}>
                <SelectTrigger>
                  <SelectValue placeholder="Select standard" />
                </SelectTrigger>
                <SelectContent>
                  {[...Array(12)].map((_, i) => (
                    <SelectItem key={i} value={(i + 1).toString()}>
                      {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div>
          <Label htmlFor="totalFees">Total Fees</Label>
          <Input id="totalFees" type="number" {...register("totalFees", { valueAsNumber: true })} />
        </div>
        <div>
          <Label htmlFor="totalAmountPaid">Total Amount Paid</Label>
          <Input id="totalAmountPaid" type="number" {...register("totalAmountPaid", { valueAsNumber: true })} />
        </div>
        <div>
          <Label htmlFor="outstandingAmount">Outstanding Amount</Label>
          <Input
            id="outstandingAmount"
            type="number"
            {...register("outstandingAmount", { valueAsNumber: true })}
            readOnly
          />
        </div>
      </div>

      <Button type="submit">{initialData ? "Update Student Fee" : "Add Student Fee"}</Button>
    </form>
  )
}

