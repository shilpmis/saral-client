import type React from "react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form } from "@/components/ui/form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PersonalDetailsForm } from "./PersonalDetailsForm"
import { AdmissionDetailsForm } from "./AdmissionDetailsForm"
import { AddressForm } from "./AddressForm"
import { BankDetailsForm } from "./BankDetailsForm"
import { StudentFormData, studentFormSchema } from "@/utils/student.validation"

interface StudentFormProps {
   onClose: () => void
    onSubmit: (data: StudentFormData) => void
    mode: "add" | "edit"
    initialData?: Partial<StudentFormData>
}

const StudentForm: React.FC<StudentFormProps> = ({ onSubmit, initialData }) => {
  const [activeTab, setActiveTab] = useState<string>("personal")
  const [formData, setFormData] = useState<Partial<StudentFormData>>(initialData || {})

  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: formData,
  })

  const handlePersonalDetailsSubmit = (data: Partial<StudentFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
    setActiveTab("admission")
  }

  const handleAdmissionDetailsSubmit = (data: Partial<StudentFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
    setActiveTab("address")
  }

  const handleAddressSubmit = (data: Partial<StudentFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
    setActiveTab("bank")
  }

  const handleBankDetailsSubmit = (data: Partial<StudentFormData>) => {
    const finalData = { ...formData, ...data }
    onSubmit(finalData as StudentFormData)
  }

  return (
      <div className="space-y-6">
        <Tabs value={activeTab} className="w-full">
          <TabsList>
            <TabsTrigger value="personal">Personal Details</TabsTrigger>
            <TabsTrigger value="admission">Admission Details</TabsTrigger>
            <TabsTrigger value="address">Address Details</TabsTrigger>
            <TabsTrigger value="bank">Bank Details</TabsTrigger>
          </TabsList>
          <TabsContent value="personal">
            <PersonalDetailsForm onSubmit={handlePersonalDetailsSubmit} defaultValues={formData} />
          </TabsContent>
          <TabsContent value="admission">
            <AdmissionDetailsForm
              onSubmit={handleAdmissionDetailsSubmit}
              onPrevious={() => setActiveTab("personal")}
              defaultValues={formData}
            />
          </TabsContent>
          <TabsContent value="address">
            <AddressForm
              onSubmit={handleAddressSubmit}
              onPrevious={() => setActiveTab("admission")}
              defaultValues={formData}
            />
          </TabsContent>
          <TabsContent value="bank">
            <BankDetailsForm
              onSubmit={handleBankDetailsSubmit}
              onPrevious={() => setActiveTab("address")}
              defaultValues={formData}
            />
          </TabsContent>
        </Tabs>
      </div>
  )
}

export default StudentForm

