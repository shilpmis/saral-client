import type React from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { PayrollEntry } from "../../types/payroll"

type PolicyFormData = Omit<PayrollEntry, "id" | "active" | "lastPayDate"> & { policyName: string }

const generateRandomNumber = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min)

const defaultPolicy: PolicyFormData = {
  policyName: "Default Policy",
  name: "",
  role: "",
  category: "teaching",
  salary: {
    basic: generateRandomNumber(20000, 50000),
    gradePay: generateRandomNumber(5000, 15000),
    inflation: generateRandomNumber(1000, 5000),
    houseRentAllowance: generateRandomNumber(5000, 15000),
    permanentTravel: generateRandomNumber(1000, 5000),
    medicalAllowance: generateRandomNumber(1000, 5000),
    localAllowance: generateRandomNumber(1000, 5000),
    principalsAllowance: generateRandomNumber(1000, 5000),
    supervisor: generateRandomNumber(1000, 5000),
    highMedianAllowance: generateRandomNumber(1000, 5000),
    cashAllowance: generateRandomNumber(1000, 5000),
    disabilityAllowance: generateRandomNumber(1000, 5000),
    chargeAllowance: generateRandomNumber(1000, 5000),
    transportAllowance: generateRandomNumber(1000, 5000),
    ncash: generateRandomNumber(1000, 5000),
    ltc: generateRandomNumber(1000, 5000),
    specialSalary: generateRandomNumber(1000, 5000),
    bonus: generateRandomNumber(1000, 5000),
    ariasAllowance: generateRandomNumber(1000, 5000),
    additionalInflation: generateRandomNumber(1000, 5000),
    interimRelief: generateRandomNumber(1000, 5000),
    other: generateRandomNumber(1000, 5000),
    otherSalaryReason: "Other salary components",
  },
  deductions: {
    gpf: generateRandomNumber(1000, 5000),
    cpf: generateRandomNumber(1000, 5000),
    gpfLoan: generateRandomNumber(1000, 5000),
    cpfLoan: generateRandomNumber(1000, 5000),
    housingLoan: generateRandomNumber(1000, 5000),
    incomeTax: generateRandomNumber(1000, 5000),
    professionalTax: generateRandomNumber(100, 1000),
    insuranceDeduction: generateRandomNumber(500, 2000),
    grainAdvance: generateRandomNumber(500, 2000),
    festivalPrelude: generateRandomNumber(500, 2000),
    cooperativeSociety1: generateRandomNumber(500, 2000),
    cooperativeSociety2: generateRandomNumber(500, 2000),
    recovery: generateRandomNumber(500, 2000),
    groupInsurance: generateRandomNumber(500, 2000),
    retailDiscount1: generateRandomNumber(500, 2000),
    additionalGPF: generateRandomNumber(500, 2000),
    ple: generateRandomNumber(500, 2000),
    otherDeductions: generateRandomNumber(500, 2000),
    otherDeductionReason: "Other deductions",
  },
}

interface PolicyFormProps {
  onSubmit: (data: PolicyFormData) => void
  initialData?: PolicyFormData
}

export const PolicyForm: React.FC<PolicyFormProps> = ({ onSubmit, initialData = defaultPolicy }) => {
    const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm<PolicyFormData>({
      defaultValues: initialData,
    })
  
    const onSubmitForm = (data: PolicyFormData) => {
      onSubmit(data)
    }
  
    return (
      <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Policy Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="policyName">Policy Name</Label>
                <Input id="policyName" {...register("policyName", { required: "Policy name is required" })} />
                {errors.policyName && <p className="text-red-500 text-sm mt-1">{errors.policyName.message}</p>}
              </div>
            </div>
          </CardContent>
        </Card>
  
        {/* Tabs Section */}
        <Tabs defaultValue="salary">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="salary">Salary Components</TabsTrigger>
            <TabsTrigger value="deductions">Deductions</TabsTrigger>
          </TabsList>
  
          {/* Scrollable Content */}
          <div className="max-h-[400px] overflow-y-auto border rounded-md">
            <TabsContent value="salary">
              <Card>
                <CardHeader>
                  <CardTitle>Salary Components</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.keys(initialData.salary).map((key) => (
                      <div key={key}>
                        <Label htmlFor={`salary.${key}`}>{key}</Label>
                        <Input
                          id={`salary.${key}`}
                          type={key === "otherSalaryReason" ? "text" : "number"}
                          {...register(`salary.${key as keyof PolicyFormData["salary"]}`, {
                            required: `${key} is required`,
                            valueAsNumber: key !== "otherSalaryReason",
                          })}
                        />
                        {errors.salary?.[key as keyof PolicyFormData["salary"]] && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.salary[key as keyof PolicyFormData["salary"]]?.message}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="deductions">
              <Card>
                <CardHeader>
                  <CardTitle>Deductions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.keys(initialData.deductions).map((key) => (
                      <div key={key}>
                        <Label htmlFor={`deductions.${key}`}>{key}</Label>
                        <Input
                          id={`deductions.${key}`}
                          type={key === "otherDeductionReason" ? "text" : "number"}
                          {...register(`deductions.${key as keyof PolicyFormData["deductions"]}`, {
                            required: `${key} is required`,
                            valueAsNumber: key !== "otherDeductionReason",
                          })}
                        />
                        {errors.deductions?.[key as keyof PolicyFormData["deductions"]] && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.deductions[key as keyof PolicyFormData["deductions"]]?.message}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
  
        <Button type="submit">Save Policy</Button>
      </form>
    )
  }
              
