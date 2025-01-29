import type React from "react"
import { useState } from "react"
import { SaralCard } from "../ui/common/SaralCard"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"

export default function GeneralSettings() {
  const [schoolDetails, setSchoolDetails] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    school_code: "",
    subscription_type: "",
    subscription_start_date: "",
    subscription_end_date: "",
  })

  const [expandedSection, setExpandedSection] = useState<string | null>("basic")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [validFields, setValidFields] = useState<{ [key: string]: boolean }>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setSchoolDetails({ ...schoolDetails, [id]: value })
    validateField(id, value)
  }

  const handleSelectChange = (value: string, field: string) => {
    setSchoolDetails({ ...schoolDetails, [field]: value })
    validateField(field, value)
  }

  const validateField = (field: string, value: string) => {
    let isValid = true
    switch (field) {
      case "email":
        isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        break
      case "phone":
        isValid = /^\+?[1-9]\d{1,14}$/.test(value)
        break
      default:
        isValid = value.trim() !== ""
    }
    setValidFields((prev) => ({ ...prev, [field]: isValid }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsDialogOpen(true)
  }

  const saveChanges = () => {
    console.log("Saving school details:", schoolDetails)
    setIsDialogOpen(false)
    setIsEditing(false)
    toast({
      title: "Settings saved",
      description: "Your school details have been updated successfully.",
    })
  }

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  const toggleEditing = () => {
    setIsEditing(!isEditing)
  }

  const renderField = (id: string, label: string, type = "text") => (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        placeholder={`Enter ${label.toLowerCase()}`}
        value={schoolDetails[id as keyof typeof schoolDetails]}
        onChange={handleInputChange}
        disabled={!isEditing}
        className={!isEditing ? "bg-gray-100" : ""}
      />
    </div>
  )

  return (
    <form onSubmit={handleSubmit}>
      <SaralCard title="School Information" description="Update your school's details and subscription information">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection("basic")}>
              <h3 className="text-lg font-medium">Basic Information</h3>
              {expandedSection === "basic" ? <ChevronUp /> : <ChevronDown />}
            </div>
            {expandedSection === "basic" && (
              <div className="grid gap-4">
                {renderField("name", "School Name")}
                {renderField("school_code", "School Code")}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection("contact")}>
              <h3 className="text-lg font-medium">Contact Information</h3>
              {expandedSection === "contact" ? <ChevronUp /> : <ChevronDown />}
            </div>
            {expandedSection === "contact" && (
              <div className="grid gap-4">
                {renderField("email", "Email Address", "email")}
                {renderField("phone", "Phone Number", "tel")}
                <div className="grid gap-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    placeholder="Enter school address"
                    className={`resize-none ${!isEditing ? "bg-gray-100" : ""}`}
                    rows={3}
                    value={schoolDetails.address}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleSection("subscription")}
            >
              <h3 className="text-lg font-medium">Subscription Details</h3>
              {expandedSection === "subscription" ? <ChevronUp /> : <ChevronDown />}
            </div>
            {expandedSection === "subscription" && (
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="subscription_type">Subscription Type</Label>
                  <Select
                    onValueChange={(value) => handleSelectChange(value, "subscription_type")}
                    value={schoolDetails.subscription_type}
                    disabled={!isEditing}
                  >
                    <SelectTrigger className={!isEditing ? "bg-gray-100" : ""}>
                      <SelectValue placeholder="Select subscription type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {renderField("subscription_start_date", "Start Date", "date")}
                {renderField("subscription_end_date", "End Date", "date")}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-6 space-x-2">
          <Button type="button" variant="outline" onClick={toggleEditing}>
            {isEditing ? "Cancel" : "Edit"}
          </Button>
          <Button type="submit" disabled={!isEditing}>
            Save Changes
          </Button>
        </div>
      </SaralCard>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Changes</DialogTitle>
            <DialogDescription>
              Are you sure you want to save these changes to your school information?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveChanges}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  )
}

