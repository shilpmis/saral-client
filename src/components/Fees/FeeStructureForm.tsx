import type React from "react"
import { useForm, Controller } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { FeeStructure } from "./FeeStructureManagement"

interface FeeStructureFormProps {
  onSubmit: (data: FeeStructure) => void
  initialData?: FeeStructure | null
}

const defaultFeeStructure: FeeStructure = {
  id: "",
  standard: 1,
  totalAnnualFee: 0,
  schoolFees: 0,
  examinationFee: 0,
  entranceFee: 0,
  registrationFee: 0,
  labFees: 0,
  activityFee: 0,
  computerFee: 0,
  additionalFees: 0,
  termFee: 0,
  isActive: true,
}

export const FeeStructureForm: React.FC<FeeStructureFormProps> = ({ onSubmit, initialData }) => {
  const { register, handleSubmit, control, watch } = useForm<FeeStructure>({
    defaultValues: initialData || defaultFeeStructure,
  })

  const watchedFields = watch()

  const calculateTotalAnnualFee = () => {
    return Object.keys(watchedFields).reduce((total, key) => {
      if (key !== "id" && key !== "standard" && key !== "totalAnnualFee" && key !== "isActive") {
        return total + ((watchedFields[key as keyof FeeStructure] as number) || 0)
      }
      return total
    }, 0)
  }

  const onFormSubmit = (data: FeeStructure) => {
    onSubmit({
      ...data,
      totalAnnualFee: calculateTotalAnnualFee(),
    })
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
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
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="schoolFees">School Fees</Label>
          <Input id="schoolFees" type="number" {...register("schoolFees", { valueAsNumber: true })} />
        </div>
        <div>
          <Label htmlFor="examinationFee">Examination Fee</Label>
          <Input id="examinationFee" type="number" {...register("examinationFee", { valueAsNumber: true })} />
        </div>
        <div>
          <Label htmlFor="entranceFee">Entrance Fee</Label>
          <Input id="entranceFee" type="number" {...register("entranceFee", { valueAsNumber: true })} />
        </div>
        <div>
          <Label htmlFor="registrationFee">Registration Fee</Label>
          <Input id="registrationFee" type="number" {...register("registrationFee", { valueAsNumber: true })} />
        </div>
        <div>
          <Label htmlFor="labFees">Lab Fees</Label>
          <Input id="labFees" type="number" {...register("labFees", { valueAsNumber: true })} />
        </div>
        <div>
          <Label htmlFor="activityFee">Activity Fee</Label>
          <Input id="activityFee" type="number" {...register("activityFee", { valueAsNumber: true })} />
        </div>
        <div>
          <Label htmlFor="computerFee">Computer Fee</Label>
          <Input id="computerFee" type="number" {...register("computerFee", { valueAsNumber: true })} />
        </div>
        <div>
          <Label htmlFor="additionalFees">Additional Fees</Label>
          <Input id="additionalFees" type="number" {...register("additionalFees", { valueAsNumber: true })} />
        </div>
        <div>
          <Label htmlFor="termFee">Term Fee</Label>
          <Input id="termFee" type="number" {...register("termFee", { valueAsNumber: true })} />
        </div>
      </div>

      <div>
        <Label>Total Annual Fee</Label>
        <div className="text-2xl font-bold">{calculateTotalAnnualFee()}</div>
      </div>

      <Button type="submit">{initialData ? "Update Fee Structure" : "Add Fee Structure"}</Button>
    </form>
  )
}

