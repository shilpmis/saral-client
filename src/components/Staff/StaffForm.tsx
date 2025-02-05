import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PersonalDetailsForm } from "./PersonalDetailsForm"
import { AddressForm } from "./AddressForm"
import { BankDetailsForm } from "./BankDetailsForm"
import type { StaffFormData } from "@/utils/validation"

interface StaffFormProps {
  onClose: () => void
  onSubmit: (data: StaffFormData) => void
  mode: "add" | "edit"
  initialData?: Partial<StaffFormData>
}

export function StaffForm({ onClose, onSubmit, mode, initialData }: StaffFormProps) {
  const [activeTab, setActiveTab] = useState<string>("personal")
  const [formData, setFormData] = useState<Partial<StaffFormData>>(initialData || {})

  const handlePersonalDetailsSubmit = (data: Partial<StaffFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
    setActiveTab("address")
  }

  const handleAddressSubmit = (data: Partial<StaffFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
    setActiveTab("bank")
  }

  const handleBankDetailsSubmit = (data: Partial<StaffFormData>) => {
    const finalData = { ...formData, ...data }
    onSubmit(finalData as StaffFormData)
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal">Personal Details</TabsTrigger>
          <TabsTrigger value="address">Address</TabsTrigger>
          <TabsTrigger value="bank">Bank Details</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <PersonalDetailsForm onSubmit={handlePersonalDetailsSubmit} defaultValues={formData} />
        </TabsContent>

        <TabsContent value="address">
          <AddressForm
            onSubmit={handleAddressSubmit}
            onPrevious={() => setActiveTab("personal")}
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

